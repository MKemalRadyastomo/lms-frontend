import { useEffect, useRef } from 'react'

interface PerformanceMetrics {
  componentName: string
  renderTime: number
  mountTime: number
}

export function usePerformanceMonitor(componentName: string) {
  const renderStartTime = useRef<number>()
  const mountStartTime = useRef<number>()

  useEffect(() => {
    mountStartTime.current = performance.now()
    
    return () => {
      if (mountStartTime.current) {
        const mountTime = performance.now() - mountStartTime.current
        console.log(`${componentName} mount time:`, mountTime)
      }
    }
  }, [componentName])

  useEffect(() => {
    renderStartTime.current = performance.now()
  })

  useEffect(() => {
    if (renderStartTime.current) {
      const renderTime = performance.now() - renderStartTime.current
      if (renderTime > 16) { // Only log if render time > 16ms (60fps threshold)
        console.warn(`${componentName} slow render:`, renderTime)
      }
    }
  })
}

export function useWebVitals() {
  useEffect(() => {
    // Report Web Vitals if supported
    if ('web-vital' in window) {
      // This would integrate with real Web Vitals library
      console.log('Web Vitals monitoring enabled')
    }
  }, [])
}