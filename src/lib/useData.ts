import { useEffect, useState } from 'react'

export function useData<T>(fn: () => Promise<T>, version = 0) {
  const [data, setData] = useState<T>()
  useEffect(() => { fn().then(setData, () => {}) }, [fn, version])
  return data
}
