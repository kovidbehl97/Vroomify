import Link from 'next/link'
import React from 'react'

function NavBar() {
  return (
    <div className='absolute top-0 left-0 w-full h-[100px] flex justify-between items-center px-20 z-[1]'>
      <div>Vroomify</div>
      <ul>
        <li><Link href="/login">LogIn</Link></li>
      </ul>
    </div>
  )
}

export default NavBar