import EventHorizon from '../components/EventHorizon/EventHorizon'

export default function EventHorizonPage() {
  return (
    <div className="relative w-full h-screen">
      <EventHorizon />
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center text-white z-10 pointer-events-none">
        <h1 className="text-4xl font-bold mb-4">The Event Horizon</h1>
        <p className="text-xl max-w-2xl">
          As we approach the point of no return, the very fabric of spacetime begins to warp and twist. 
          The Event Horizon marks the boundary between what was and what could be - a threshold that, 
          once crossed, changes everything.
        </p>
      </div>
    </div>
  )
}
