import Link from 'next/link';
import React from 'react'

function CustomButton({href,title, containerStyles}: {
  href: string;
  title: string;
  containerStyles: string;
}) {
  return (
    <Link href={href} className={containerStyles}>{title}</Link>
  )
}

export default CustomButton