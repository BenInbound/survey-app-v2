'use client'

import { useState } from 'react'
import { Department } from '@/lib/types'

interface DepartmentConfigProps {
  departments: Department[]
  onDepartmentsChange: (departments: Department[]) => void
  organizationName: string
}

export default function DepartmentConfig({ departments, onDepartmentsChange, organizationName }: DepartmentConfigProps) {
  const [showAddForm, setShowAddForm] = useState(false)
  const [newDepartmentName, setNewDepartmentName] = useState('')

  const generateDepartmentCodes = (departmentName: string, departments: Department[]) => {
    // Generate a unique department ID from name
    const sanitizedName = departmentName
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '')
      .substring(0, 8)
    
    let departmentId = sanitizedName
    let counter = 1
    
    // Ensure unique ID
    while (departments.some(d => d.id === departmentId)) {
      departmentId = `${sanitizedName}${counter}`
      counter++
    }

    // Generate access codes (these will be generated properly by AccessController)
    const timestamp = Date.now().toString().slice(-4)
    const orgCode = organizationName.replace(/[^a-zA-Z0-9]/g, '').substring(0, 8).toUpperCase()
    const deptCode = departmentName.replace(/[^a-zA-Z0-9]/g, '').substring(0, 3).toUpperCase()
    
    return {
      id: departmentId,
      managementCode: `${orgCode}-MGMT-${deptCode}${timestamp}`,
      employeeCode: `${orgCode}-EMP-${deptCode}${timestamp}`
    }
  }

  const handleAddDepartment = () => {
    if (!newDepartmentName.trim()) return

    const codes = generateDepartmentCodes(newDepartmentName.trim(), departments)
    
    const newDepartment: Department = {
      id: codes.id,
      name: newDepartmentName.trim(),
      managementCode: codes.managementCode,
      employeeCode: codes.employeeCode
    }

    onDepartmentsChange([...departments, newDepartment])
    setNewDepartmentName('')
    setShowAddForm(false)
  }

  const handleRemoveDepartment = (departmentId: string) => {
    onDepartmentsChange(departments.filter(d => d.id !== departmentId))
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      // Could add toast notification here
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-neutral-700">
          Department Configuration
        </h4>
        <button
          type="button"
          onClick={() => setShowAddForm(true)}
          className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Department
        </button>
      </div>

      {/* Add Department Form */}
      {showAddForm && (
        <div className="border border-neutral-200 rounded-lg p-4 bg-neutral-50">
          <div className="space-y-3">
            <div>
              <label htmlFor="department-name-input" className="block text-sm font-medium text-neutral-700 mb-1">
                Department Name
              </label>
              <input
                id="department-name-input"
                type="text"
                value={newDepartmentName}
                onChange={(e) => setNewDepartmentName(e.target.value)}
                placeholder="e.g., Human Resources, Engineering, Sales"
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 text-sm"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    handleAddDepartment()
                  }
                  if (e.key === 'Escape') {
                    setShowAddForm(false)
                    setNewDepartmentName('')
                  }
                }}
              />
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleAddDepartment}
                disabled={!newDepartmentName.trim()}
                className="flex-1 bg-primary-600 text-white px-3 py-2 rounded-lg hover:bg-primary-700 transition-colors disabled:bg-neutral-300 disabled:cursor-not-allowed text-sm"
              >
                Add Department
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false)
                  setNewDepartmentName('')
                }}
                className="flex-1 bg-neutral-200 text-neutral-700 px-3 py-2 rounded-lg hover:bg-neutral-300 transition-colors text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Departments List */}
      {departments.length === 0 ? (
        <div className="text-center py-6 bg-neutral-50 rounded-lg border border-neutral-200">
          <div className="text-neutral-400 text-sm mb-2">
            No departments configured
          </div>
          <p className="text-neutral-600 text-xs">
            Add departments to enable role-specific survey distribution
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {departments.map((department) => (
            <div key={department.id} className="border border-neutral-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h5 className="font-medium text-neutral-900">{department.name}</h5>
                <button
                  type="button"
                  onClick={() => handleRemoveDepartment(department.id)}
                  className="text-neutral-400 hover:text-red-500 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-neutral-500 w-20">Management:</span>
                  <code className="text-xs bg-neutral-100 px-2 py-1 rounded font-mono text-primary-700">
                    {department.managementCode}
                  </code>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(department.managementCode)}
                    className="text-neutral-400 hover:text-primary-600 transition-colors"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </button>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className="text-xs text-neutral-500 w-20">Employee:</span>
                  <code className="text-xs bg-neutral-100 px-2 py-1 rounded font-mono text-primary-700">
                    {department.employeeCode}
                  </code>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(department.employeeCode)}
                    className="text-neutral-400 hover:text-primary-600 transition-colors"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <svg className="w-4 h-4 text-blue-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="text-xs text-blue-700">
                <strong>Distribution:</strong> Share management codes with department leaders and employee codes with team members. 
                Each code provides role-appropriate survey access.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}