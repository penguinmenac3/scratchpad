export function toTwoDigits(value: number): number {
    return Math.round(value * 100) / 100
}
