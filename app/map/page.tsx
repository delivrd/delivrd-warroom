export default function MapPage() {
  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
      <div className="mb-16">
        <h1 className="text-[56px] font-bold tracking-tight mb-4" style={{ color: '#f5f5f7' }}>
          Battle Map
        </h1>
        <p className="text-[20px] tracking-tight" style={{ color: '#86868b' }}>
          Visual strategy overview by zone and priority.
        </p>
      </div>

      <div 
        className="rounded-[14px] p-20 text-center backdrop-blur-xl border-2 border-dashed"
        style={{
          backgroundColor: 'rgba(21, 21, 24, 0.4)',
          borderColor: '#2c2c2e'
        }}
      >
        <p className="text-[20px] font-medium mb-4" style={{ color: '#f5f5f7' }}>
          Phase 2 Feature
        </p>
        <p className="text-[17px]" style={{ color: '#86868b' }}>
          Zone-based front overview with conversion paths
        </p>
      </div>
    </div>
  );
}
