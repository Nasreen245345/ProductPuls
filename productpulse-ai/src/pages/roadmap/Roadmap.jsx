import { useEffect, useState } from 'react'
import { Map, AlertTriangle, RotateCcw } from 'lucide-react'
import { useProducts } from '../../hooks/useProducts'
import { generateRoadmap, fetchRoadmap, updateRoadmapItemStatus } from '../../services/roadmapService'
import { RoadmapCard } from '../../components/cards/RoadmapCard'
import { Select } from '../../components/ui/Select'
import { Button } from '../../components/ui/Button'
import { EmptyState } from '../../components/ui/EmptyState'
import { Skeleton } from '../../components/ui/Skeleton'

export function Roadmap() {
  const { products, isLoading: productsLoading } = useProducts({ limit: 100 })
  const [selectedProductId, setSelectedProductId] = useState('')

  const [items, setItems] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState(null)
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false)

  // Auto-select the first product once products finish loading.
  useEffect(() => {
    if (!selectedProductId && products.length > 0) {
      setSelectedProductId(products[0].id)
    }
  }, [products, selectedProductId])

  useEffect(() => {
    if (!selectedProductId) return
    setIsLoading(true)
    setError(null)
    fetchRoadmap(selectedProductId)
      .then((res) => setItems(res.data))
      .catch((err) => {
        if (err.code === 'ROADMAP_NOT_FOUND') {
          setItems([])
        } else {
          setError(err)
        }
      })
      .finally(() => {
        setIsLoading(false)
        setHasLoadedOnce(true)
      })
  }, [selectedProductId])

  const handleGenerate = async () => {
    setIsGenerating(true)
    setError(null)
    try {
      const res = await generateRoadmap(selectedProductId)
      setItems(res.data)
    } catch (err) {
      setError(err)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleStatusChange = async (itemId, status) => {
    const previous = items
    setItems((prev) => prev.map((i) => (i.id === itemId ? { ...i, status } : i)))
    try {
      await updateRoadmapItemStatus(itemId, status)
    } catch {
      setItems(previous) // revert on failure
    }
  }

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-page-heading text-primary">Roadmap</h1>
          <p className="text-body mt-1 text-secondary">
            AI-generated feature priorities, backed by the evidence behind each one.
          </p>
        </div>
        {items.length > 0 && (
          <Button variant="outline" leftIcon={<RotateCcw size={15} />} loading={isGenerating} onClick={handleGenerate}>
            Regenerate
          </Button>
        )}
      </div>

      {productsLoading ? (
        <Skeleton className="h-10 w-64" />
      ) : products.length === 0 ? (
        <EmptyState icon={Map} title="No products yet" description="Create a product before generating a roadmap." />
      ) : (
        <>
          <Select
            value={selectedProductId}
            onChange={(e) => setSelectedProductId(e.target.value)}
            options={products.map((p) => ({ value: p.id, label: p.name }))}
            className="max-w-xs"
          />

          <div className="mt-4">
            {isLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-32 w-full" />
              </div>
            ) : error ? (
              <EmptyState
                icon={AlertTriangle}
                title={error.code === 'INSIGHTS_REQUIRED' ? 'Generate insights first' : "Couldn't generate roadmap"}
                description={error.message}
                action={error.code !== 'INSIGHTS_REQUIRED' ? { label: 'Try Again', onClick: handleGenerate } : undefined}
              />
            ) : items.length === 0 && hasLoadedOnce ? (
              <EmptyState
                icon={Map}
                title="No roadmap generated yet"
                description="Generate an AI-prioritized roadmap from this product's insights."
                action={{ label: 'Generate Roadmap', onClick: handleGenerate }}
              />
            ) : (
              <div className="space-y-3">
                {items.map((item) => (
                  <RoadmapCard key={item.id} item={item} onStatusChange={(status) => handleStatusChange(item.id, status)} />
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
