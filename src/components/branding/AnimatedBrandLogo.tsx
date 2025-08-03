import insperityLogo from '@/assets/images/insperity-health-ai-logo.png'

// Blue gradient heart with 3D AI cube logo
export default function AnimatedBrandLogo() {
  return (
    <div className="flex flex-col items-center">
      <img 
        src={insperityLogo} 
        alt="Insperity Health AI" 
        width={600} 
        height={600}
      />
    </div>
  )
}