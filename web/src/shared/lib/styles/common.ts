export function switchBadgeCn1(flag: boolean) {
  return flag
    ? 'bg-green-500 hover:bg-green-600 w-12 justify-center'
    : 'bg-red-500 hover:bg-red-600 w-12 justify-center';
}

export function switchBadgeCn2(flag: boolean) {
  return flag ? 'font-extrabold w-12 justify-center' : 'text-black/70 w-12 justify-center';
}
