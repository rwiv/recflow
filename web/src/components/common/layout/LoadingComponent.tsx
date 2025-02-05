export function LoadingComponent({ relWidth }: { relWidth?: string }) {
  if (!relWidth) {
    relWidth = '10rem';
  }
  return (
    <div className="flex justify-center items-center h-screen w-screen relative">
      <div
        className={`absolute top-[calc(50%-${relWidth})] w-16 h-16 border-4 border-gray-600 border-t-transparent rounded-full animate-spin`}
      />
    </div>
  );
}
