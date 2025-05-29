import { getServerSession } from "next-auth/next";
import { authOptions } from "../../_lib/auth";
import { redirect } from "next/navigation";
import { getMongoClient } from "../../_lib/mongodb";
import { ObjectId } from "mongodb";

interface Booking {
  _id: ObjectId;
  userId: string;
  carId: string;
  pickupDate: string;
  dropoffDate: string;
  pickupTime: string;
  dropoffTime: string;
  location: string;
  amount: number;
  currency: string;
  status: string;
  createdAt: Date;
  sessionId: string;
}

interface Car {
  _id: ObjectId;
  name: string;
  make: string;
  model: string;
  price: number;
  image: string;
}

interface BookingWithCar extends Booking {
  carDetails?: Car;
}

export default async function BookingHistoryPage() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || !session.user.id) {
    redirect("/login");
  }

  const loggedInUserId = session.user.id;

  let client;
  let userBookings: Booking[] = [];
  let cars: Car[] = [];
  const bookingsWithCar: BookingWithCar[] = [];

  try {
    client = await getMongoClient();
    const db = client.db("cars");
    userBookings = await db
      .collection<Booking>("bookings")
      .find({
        userId: loggedInUserId,
      })
      .toArray();

    const carIds = userBookings.map((booking) => booking.carId);
    const uniqueCarIds = [...new Set(carIds)];

    if (uniqueCarIds.length > 0) {
      const carObjectIds = uniqueCarIds
        .map((id) => {
          try {
            if (ObjectId.isValid(id)) {
              return new ObjectId(id);
            } else {
              return null;
            }
          } catch (e) {
            console.warn(`Error processing Car ObjectId: ${id}`, e);
            return null;
          }
        })
        .filter((id) => id !== null) as ObjectId[];
      if (carObjectIds.length > 0) {
        cars = await db
          .collection<Car>("cars")
          .find({
            _id: { $in: carObjectIds },
          })
          .toArray();
        console.warn(`Found ${cars.length} car documents for bookings.`);
      } else {
        console.warn("No valid car ObjectIds found among user bookings.");
      }
    } else {
      console.warn("No car IDs found in user bookings.");
    }
    const carDetailsMap = new Map<string, Car>();
    cars.forEach((car) => carDetailsMap.set(car._id.toString(), car));

    userBookings.forEach((booking) => {
      const bookingWithCar: BookingWithCar = { ...booking };
      const carDetails = carDetailsMap.get(booking.carId);
      if (carDetails) {
        bookingWithCar.carDetails = carDetails;
      } else {
        console.warn(
          `Car details not found in DB for carId: ${booking.carId} referenced in booking ${booking._id}.`
        );
      }
      bookingsWithCar.push(bookingWithCar);
    });
    bookingsWithCar.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  } catch (error) {
    console.error("Failed to fetch booking history:", error);
    return (
      <div className="container mx-auto mt-8">
        <h1 className="text-2xl font-bold">Booking History</h1>
        <p className="text-red-600">
          Failed to load booking history. Please try again later.
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6 text-center">Booking History</h1>

      {bookingsWithCar.length === 0 ? (
        <p className="text-center">You have no booking history yet.</p>
      ) : (
        <div className="max-w-2xl mx-auto">
          {bookingsWithCar.map((booking) => (
            <div
              key={booking._id.toString()}
              className="mb-6 p-4 border rounded-lg shadow-sm bg-white"
            >
              <h2 className="text-xl font-semibold mb-2">
                {booking.carDetails
                  ? `${booking.carDetails.make} ${booking.carDetails.model}`
                  : `Car ID: ${booking.carId} (Details N/A)`}{" "}
              </h2>
              {booking.carDetails?.image && (
                <img
                  src={booking.carDetails.image}
                  alt={`${booking.carDetails.make} ${booking.carDetails.model}`}
                  className="w-full h-40 object-cover rounded-md mb-2"
                />
              )}
              <p>
                <strong>Dates:</strong> {booking.pickupDate} to{" "}
                {booking.dropoffDate}
              </p>
              <p>
                <strong>Times:</strong> {booking.pickupTime} to{" "}
                {booking.dropoffTime}
              </p>
              <p>
                <strong>Location:</strong> {booking.location}
              </p>
              {typeof booking.amount === "number" && !isNaN(booking.amount) && (
                <p>
                  <strong>Amount Paid:</strong> ${booking.amount.toFixed(2)}{" "}
                  {booking.currency?.toUpperCase()}
                </p>
              )}
              <p>
                <strong>Status:</strong> {booking.status}
              </p>
              <p className="text-sm text-gray-500">
                Booked on: {new Date(booking.createdAt).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
