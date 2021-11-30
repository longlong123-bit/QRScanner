const secondInMinute = 60

export function revertSecondToHour(workedHours) {
    const totalHours = Math.floor(workedHours)
    const totalMinutes = Math.floor((workedHours - totalHours)*secondInMinute)
    const totalSeconds = Math.round(((workedHours - totalHours)*secondInMinute - totalMinutes)*secondInMinute)
    return `${totalHours < 10 ? "0" : ""}${totalHours}:${totalMinutes < 10 ? "0" : ""}${totalMinutes}:${totalSeconds < 10 ? "0" : ""}${totalSeconds}`
  }