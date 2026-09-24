import React from 'react'
import { Link } from 'react-router-dom'
import DashboardLayout from '../../layouts/DashboardLayout'
import useCrops from '../../features/crops/hooks/useCrops'
import CropList from '../../features/crops/components/CropList'
import useOrders from '../../features/orders/hooks/useOrders'
import useAuth from '../../hooks/useAuth'

export default function FarmerDashboard(){
  const { crops, loading, error, create, update, remove } = useCrops()
  const { orders, loading: ordersLoading, updateStatus } = useOrders()
  const { user } = useAuth()

  const myOrders = orders.filter(o => o.farmerId && o.farmerId._id === user?.id)
  const earnings = myOrders.reduce((sum, o) => sum + (o.status === 'delivered' ? (o.amount || 0) : 0), 0)

  return (
    <DashboardLayout title="Farmer Dashboard">
      <div className="container-fluid">
        <div className="row">
          <div className="col-md-8">
            {loading && <div>Loading crops...</div>}
            {error && <div className="text-danger">Error loading crops</div>}
            <CropList crops={crops} onCreate={create} onUpdate={update} onRemove={remove} />

            <div className="mt-4">
              <h5>Recent Orders</h5>
              {ordersLoading && <div>Loading orders...</div>}
              <table className="table">
                <thead><tr><th>Crop</th><th>Qty</th><th>Amount</th><th>Status</th><th></th></tr></thead>
                <tbody>
                  {myOrders.map(o => (
                    <tr key={o._id}>
                      <td>{o.cropId?.cropName}</td>
                      <td>{o.quantity}</td>
                      <td>₹{o.amount}</td>
                      <td>{o.status}</td>
                      <td>
                        {o.status === 'pending' && <button className="btn btn-sm btn-success" onClick={() => updateStatus(o._id, 'accepted')}>Accept</button>}
                        {o.status !== 'cancelled' && <button className="btn btn-sm btn-danger ms-2" onClick={() => updateStatus(o._id, 'cancelled')}>Cancel</button>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card shadow-sm border-0 mb-4 bg-primary-light border-primary">
              <div className="card-body">
                <div className="d-flex align-items-center gap-2 mb-2">
                  <span className="badge bg-primary">New Feature</span>
                  <h6 className="mb-0 text-primary-dark font-weight-bold">AI Crop Health</h6>
                </div>
                <p className="small text-muted mb-3">
                  Upload plant photos to scan for foliar stress, leaf spots, and get preliminary agricultural recommendations.
                </p>
                <Link to="/dashboard/crop-analysis" className="btn btn-sm btn-primary w-100">
                  Launch Crop Health AI
                </Link>
              </div>
            </div>

            <h5>Stats</h5>
            <ul>
              <li>Total listings: {crops.length}</li>
              <li>Total earnings: ₹{earnings}</li>
            </ul>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
