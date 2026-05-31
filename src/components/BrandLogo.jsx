function BrandLogo({ className = '', alt = 'Raj Tuition Classes logo' }) {
  return (
    <img
      src="/logo.png"
      alt={alt}
      className={className}
      loading="eager"
      decoding="async"
    />
  )
}

export default BrandLogo
