/**
 * @jest-environment jsdom
 */

import React from 'react'
import { render, screen } from '@testing-library/react'
import ConsultantPortal from '../page'

describe('ConsultantPortal', () => {
  it('displays professional consultant portal branding', () => {
    render(<ConsultantPortal />)
    
    expect(screen.getByText('Strategic Organizational Assessment Platform')).toBeInTheDocument()
    expect(screen.getByText('For Management Consultants')).toBeInTheDocument()
    expect(screen.getByText('Production Ready - Client Engagements')).toBeInTheDocument()
  })

  it('shows main action card with consultant dashboard link', () => {
    render(<ConsultantPortal />)
    
    expect(screen.getByText('Create & Manage Client Assessments')).toBeInTheDocument()
    expect(screen.getByText('Generate secure access codes for organizational assessments, distribute role-based surveys, and analyze comparative insights between management and employee perspectives.')).toBeInTheDocument()
    
    const dashboardLink = screen.getByRole('link', { name: /Access Consultant Dashboard/ })
    expect(dashboardLink).toHaveAttribute('href', '/consultant/dashboard')
  })

  it('highlights secure access control features', () => {
    render(<ConsultantPortal />)
    
    expect(screen.getByText('Secure Access Control')).toBeInTheDocument()
    expect(screen.getByText('Generate unique access codes per assessment to control survey distribution and prevent unauthorized access')).toBeInTheDocument()
  })

  it('emphasizes professional analytics capabilities', () => {
    render(<ConsultantPortal />)
    
    expect(screen.getByText('Professional Analytics')).toBeInTheDocument()
    expect(screen.getByText('Access comprehensive comparative analytics and AI-powered insights for client presentations')).toBeInTheDocument()
  })

  it('displays platform feature highlights', () => {
    render(<ConsultantPortal />)
    
    expect(screen.getByText('Role-Based Insights')).toBeInTheDocument()
    expect(screen.getByText('Compare management vs employee perspectives to identify organizational perception gaps')).toBeInTheDocument()
    
    expect(screen.getByText('AI-Powered Analysis')).toBeInTheDocument()
    expect(screen.getByText('Generate strategic recommendations and insights optimized for client presentations')).toBeInTheDocument()
    
    expect(screen.getByText('Privacy Protection')).toBeInTheDocument()
    expect(screen.getByText('Anonymous employee feedback aggregation maintains confidentiality and trust')).toBeInTheDocument()
  })

  it('includes minimal development tools link', () => {
    render(<ConsultantPortal />)
    
    const adminLink = screen.getByRole('link', { name: 'Development Tools' })
    expect(adminLink).toHaveAttribute('href', '/admin')
  })

  it('has professional footer messaging', () => {
    render(<ConsultantPortal />)
    
    expect(screen.getByText('Professional consulting platform for organizational strategic diagnosis')).toBeInTheDocument()
  })

  it('does not contain demo or individual assessment links', () => {
    render(<ConsultantPortal />)
    
    // Should not have individual assessment or demo content
    expect(screen.queryByText('Individual Assessment')).not.toBeInTheDocument()
    expect(screen.queryByText('Start Individual Assessment')).not.toBeInTheDocument()
    expect(screen.queryByText('Try the Organizational Assessment Demo')).not.toBeInTheDocument()
    expect(screen.queryByText('Take as Management')).not.toBeInTheDocument()
    expect(screen.queryByText('Take as Employee')).not.toBeInTheDocument()
  })

  it('uses professional color scheme and styling', () => {
    render(<ConsultantPortal />)
    
    // Check for the main container styling
    const mainContainer = document.querySelector('.min-h-screen')
    expect(mainContainer).toHaveClass('bg-gradient-to-br', 'from-slate-50', 'to-blue-50')
    
    // Check for professional blue icon
    const blueIcon = document.querySelector('.bg-blue-600')
    expect(blueIcon).toBeInTheDocument()
  })
})