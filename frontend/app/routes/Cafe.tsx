import { useState, useEffect } from 'react'
import { 
  Plus, 
  Edit, 
  Trash2, 
  Coffee, 
  ShoppingCart, 
  CreditCard,
  Search,
  Filter,
  Package,
  DollarSign,
  Clock,
  User
} from 'lucide-react'
import { getAuthHeaders } from '../utils/auth'

interface Category {
  id: number
  name: string
  products?: Product[]
}

interface Product {
  id: number
  name: string
  description?: string
  price: number
  categoryId: number
  category?: Category
}

interface OrderItem {
  productId: number
  quantity: number
  product?: Product
}

interface Order {
  id: number
  customerName?: string
  totalAmount: number
  createdAt: string
  orderItems: {
    id: number
    quantity: number
    price: number
    product: Product
  }[]
}

export default function Cafe() {
  const [activeTab, setActiveTab] = useState<'menu' | 'orders' | 'pos'>('pos')
  const [categories, setCategories] = useState<Category[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [cart, setCart] = useState<OrderItem[]>([])
  const [customerName, setCustomerName] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Modal states
  const [showCategoryModal, setShowCategoryModal] = useState(false)
  const [showProductModal, setShowProductModal] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)

  // Form states
  const [categoryForm, setCategoryForm] = useState({ name: '' })
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price: 0,
    categoryId: 0
  })

  useEffect(() => {
    fetchCategories()
    fetchProducts()
    fetchOrders()
  }, [])

  const fetchCategories = async () => {
    try {
      const response = await fetch('http://localhost:5500/categories')
      if (response.ok) {
        const data = await response.json()
        setCategories(data.categories)
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error)
    }
  }

  const fetchProducts = async () => {
    try {
      const response = await fetch('http://localhost:5500/products')
      if (response.ok) {
        const data = await response.json()
        setProducts(data.products)
      }
    } catch (error) {
      console.error('Failed to fetch products:', error)
    }
  }

  const fetchOrders = async () => {
    try {
      const response = await fetch('http://localhost:5500/orders', {
        headers: getAuthHeaders()
      })
      if (response.ok) {
        const data = await response.json()
        setOrders(data.orders)
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error)
    }
  }

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.productId === product.id)
      if (existing) {
        return prev.map(item =>
          item.productId === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      }
      return [...prev, { productId: product.id, quantity: 1, product }]
    })
  }

  const updateCartQuantity = (productId: number, quantity: number) => {
    if (quantity <= 0) {
      setCart(prev => prev.filter(item => item.productId !== productId))
    } else {
      setCart(prev =>
        prev.map(item =>
          item.productId === productId ? { ...item, quantity } : item
        )
      )
    }
  }

  const getCartTotal = () => {
    return cart.reduce((total, item) => {
      const product = products.find(p => p.id === item.productId)
      return total + (product ? parseFloat(product.price.toString()) * item.quantity : 0)
    }, 0)
  }

  const createOrder = async () => {
    if (cart.length === 0) {
      setError('Cart is empty')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('http://localhost:5500/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify({
          customerName: customerName || undefined,
          items: cart.map(item => ({
            productId: item.productId,
            quantity: item.quantity
          }))
        })
      })

      if (response.ok) {
        setSuccess('Order created successfully')
        setCart([])
        setCustomerName('')
        fetchOrders()
        
        // Show payment options
        const data = await response.json()
        handlePayment(data.order.id)
      } else {
        const data = await response.json()
        setError(data.error || 'Failed to create order')
      }
    } catch (error) {
      setError('Network error. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handlePayment = async (orderId: number) => {
    try {
      const response = await fetch('http://localhost:5500/payment/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify({ orderId })
      })

      const data = await response.json()
      
      if (response.ok) {
        // In a real app, you would redirect to Midtrans payment page
        alert(`Payment created! Token: ${data.token}`)
      } else {
        console.error('Payment creation failed:', data.error)
      }
    } catch (error) {
      console.error('Payment error:', error)
    }
  }

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory ? product.categoryId === selectedCategory : true
    return matchesSearch && matchesCategory
  })

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR'
    }).format(amount)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Coffee className="h-8 w-8 text-green-600" />
          <h1 className="text-3xl font-bold text-gray-900">Cafe Management</h1>
        </div>
        
        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
          {[
            { id: 'pos', label: 'POS', icon: ShoppingCart },
            { id: 'menu', label: 'Menu', icon: Package },
            { id: 'orders', label: 'Orders', icon: Clock }
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as any)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition ${
                activeTab === id
                  ? 'bg-white text-green-600 shadow'
                  : 'text-gray-600 hover:text-green-600'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md">
          {success}
        </div>
      )}

      {/* POS Tab */}
      {activeTab === 'pos' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Products */}
          <div className="lg:col-span-2 space-y-4">
            {/* Search and Filter */}
            <div className="flex space-x-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
                />
              </div>
              <select
                value={selectedCategory || ''}
                onChange={(e) => setSelectedCategory(e.target.value ? parseInt(e.target.value) : null)}
                className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
              >
                <option value="">All Categories</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Product Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {filteredProducts.map(product => (
                <div
                  key={product.id}
                  className="bg-white rounded-lg shadow p-4 hover:shadow-md transition cursor-pointer"
                  onClick={() => addToCart(product)}
                >
                  <div className="aspect-square bg-gray-100 rounded-md mb-3 flex items-center justify-center">
                    <Coffee className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="font-medium text-gray-900 truncate">{product.name}</h3>
                  <p className="text-sm text-gray-500 truncate">{product.description}</p>
                  <p className="text-lg font-bold text-green-600 mt-2">
                    {formatCurrency(parseFloat(product.price.toString()))}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Cart */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Current Order</h2>
            
            {/* Customer Name */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Customer Name (Optional)
              </label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Enter customer name"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
              />
            </div>

            {/* Cart Items */}
            <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
              {cart.length === 0 ? (
                <p className="text-gray-500 text-center py-8">Cart is empty</p>
              ) : (
                cart.map(item => {
                  const product = products.find(p => p.id === item.productId)
                  if (!product) return null
                  
                  return (
                    <div key={item.productId} className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{product.name}</h4>
                        <p className="text-sm text-gray-500">
                          {formatCurrency(parseFloat(product.price.toString()))}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => updateCartQuantity(item.productId, item.quantity - 1)}
                          className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200"
                        >
                          -
                        </button>
                        <span className="w-8 text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateCartQuantity(item.productId, item.quantity + 1)}
                          className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  )
                })
              )}
            </div>

            {/* Total */}
            <div className="border-t pt-4">
              <div className="flex justify-between items-center mb-4">
                <span className="text-lg font-semibold">Total:</span>
                <span className="text-xl font-bold text-green-600">
                  {formatCurrency(getCartTotal())}
                </span>
              </div>
              
              <button
                onClick={createOrder}
                disabled={cart.length === 0 || isLoading}
                className="w-full flex items-center justify-center space-x-2 py-3 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <CreditCard className="h-4 w-4" />
                <span>{isLoading ? 'Processing...' : 'Create Order & Pay'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Menu Management Tab */}
      {activeTab === 'menu' && (
        <div className="space-y-6">
          {/* Categories Section */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Categories</h2>
              <button
                onClick={() => setShowCategoryModal(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                <Plus className="h-4 w-4" />
                <span>Add Category</span>
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {categories.map(category => (
                <div key={category.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-gray-900">{category.name}</h3>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          setEditingCategory(category)
                          setCategoryForm({ name: category.name })
                          setShowCategoryModal(true)
                        }}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button className="text-red-600 hover:text-red-800">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Products Section */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Products</h2>
              <button
                onClick={() => setShowProductModal(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                <Plus className="h-4 w-4" />
                <span>Add Product</span>
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {products.map(product => (
                <div key={product.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{product.name}</h3>
                      <p className="text-sm text-gray-500">{product.description}</p>
                      <p className="text-lg font-bold text-green-600 mt-1">
                        {formatCurrency(parseFloat(product.price.toString()))}
                      </p>
                      <p className="text-xs text-gray-400">
                        {product.category?.name}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          setEditingProduct(product)
                          setProductForm({
                            name: product.name,
                            description: product.description || '',
                            price: parseFloat(product.price.toString()),
                            categoryId: product.categoryId
                          })
                          setShowProductModal(true)
                        }}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button className="text-red-600 hover:text-red-800">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Orders Tab */}
      {activeTab === 'orders' && (
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold text-gray-900">Recent Orders</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Items
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {orders.map(order => (
                  <tr key={order.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      #{order.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {order.customerName || 'Walk-in Customer'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {order.orderItems.map(item => (
                        <div key={item.id}>
                          {item.quantity}x {item.product.name}
                        </div>
                      ))}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                      {formatCurrency(parseFloat(order.totalAmount.toString()))}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
