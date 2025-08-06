import purityLogo from '@/assets/images/purity-health-ai-logo.png'

// Purity Health AI logo
export default function AnimatedBrandLogo() {
  return (
    <div className="flex flex-col items-center">
      <img 
        src={purityLogo} 
        alt="Purity Health AI" 
        width={600} 
        height={600}
      />
    </div>
  )
}