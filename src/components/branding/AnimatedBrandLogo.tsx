import insperityLogo from '@/assets/images/insperity-health-ai-logo.png'

export default function AnimatedBrandLogo() {
  return (
    <div className="flex flex-col items-center">
      <img 
        src={insperityLogo} 
        alt="Insperity Health AI - Blue gradient heart with 3D AI cube" 
        width={600} 
        height={600}
        className="animate-pulse"
      />
    </div>
  )
}