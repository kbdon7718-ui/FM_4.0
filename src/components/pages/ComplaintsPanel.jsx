import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card.jsx';
import { Badge } from '../ui/badge.jsx';
import { Button } from '../ui/button.jsx';
import { Textarea } from '../ui/textarea.jsx';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select.jsx';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog.jsx';
import { 
  MessageSquare, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Send,
  Phone,
  Mail,
  User,
  Truck
} from 'lucide-react';

export function ComplaintsPanel() {
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [response, setResponse] = useState('');

  // Mock complaints data - Employee Transportation
  const complaints = [
    {
      id: 1,
      complaintId: 'CMP-2025-001',
      customer: 'Production Manager - Unit A',
      contactPerson: 'Ramesh Gupta',
      phone: '+91 98765 43210',
      email: 'ramesh.gupta@manufacturing.com',
      vehicle: 'TN-01-AB-1240',
      driver: 'Vikram Singh',
      issue: 'Driver stopped vehicle without reason',
      description: 'Vehicle carrying evening shift workers was stopped for 30 minutes at unauthorized location. Employees reached home late, no prior communication given.',
      severity: 'high',
      status: 'pending',
      timestamp: '2025-11-09 10:15 AM',
      route: 'Factory Gate → Chengalpattu Housing',
      location: 'NH45, near Chengalpattu'
    },
    {
      id: 2,
      complaintId: 'CMP-2025-002',
      customer: 'HR Department - SIPCOT',
      contactPerson: 'Priya Sharma',
      phone: '+91 98765 43211',
      email: 'priya.sharma@sipcot.com',
      vehicle: 'TN-01-AB-1237',
      driver: 'Anil Sharma',
      issue: 'Vehicle not arrived on time for pickup',
      description: 'Morning shift employees were waiting for 45 minutes. Vehicle was supposed to arrive at 6:00 AM but reached at 6:45 AM. Production start delayed.',
      severity: 'medium',
      status: 'investigating',
      timestamp: '2025-11-09 08:45 AM',
      route: 'Kanchipuram Colony → SIPCOT Factory',
      location: 'Kanchipuram Pickup Point'
    },
    {
      id: 3,
      complaintId: 'CMP-2025-003',
      customer: 'Safety Officer - Factory',
      contactPerson: 'Suresh Kumar',
      phone: '+91 98765 43212',
      email: 'suresh.kumar@factory.com',
      vehicle: 'TN-01-AB-1234',
      driver: 'Rajesh Kumar',
      issue: 'Rash driving reported by employees',
      description: 'Multiple employees complained about overspeeding and harsh braking. Safety concerns raised during morning commute. Need driver counseling.',
      severity: 'high',
      status: 'resolved',
      timestamp: '2025-11-09 07:30 AM',
      route: 'Avadi Residential → Factory Gate 2',
      location: 'Ambattur Industrial Road'
    },
    {
      id: 4,
      complaintId: 'CMP-2025-004',
      customer: 'Admin Head - Oragadam Unit',
      contactPerson: 'Anita Desai',
      phone: '+91 98765 43213',
      email: 'anita.desai@oragadam.com',
      vehicle: 'TN-01-AB-1229',
      driver: 'Suresh Reddy',
      issue: 'Driver behavior unprofessional',
      description: 'Driver was rude to employees during pickup. Refused to wait for 2 employees who were 3 minutes late. Unprofessional conduct reported.',
      severity: 'medium',
      status: 'pending',
      timestamp: '2025-11-08 04:20 PM',
      route: 'Guduvanchery Pickup → Mahindra City',
      location: 'Guduvanchery Pickup Point'
    },
    {
      id: 5,
      complaintId: 'CMP-2025-005',
      customer: 'Plant Manager - Pharma Unit',
      contactPerson: 'Manoj Patel',
      phone: '+91 98765 43214',
      email: 'manoj.patel@pharma.com',
      vehicle: 'TN-01-AB-1245',
      driver: 'Ramesh Yadav',
      issue: 'AC not working, uncomfortable journey',
      description: 'AC system was not working during evening shift drop. With 35+ employees, vehicle became very hot and uncomfortable. Maintenance needed urgently.',
      severity: 'high',
      status: 'investigating',
      timestamp: '2025-11-08 02:15 PM',
      route: 'Pharma Unit → Chengalpattu Housing',
      location: 'Pharma Factory Gate'
    },
    {
      id: 6,
      complaintId: 'CMP-2025-006',
      customer: 'Shift Supervisor - Electronics',
      contactPerson: 'Kavita Singh',
      phone: '+91 98765 43215',
      email: 'kavita.singh@electronics.com',
      vehicle: 'TN-01-AB-1236',
      driver: 'Vikram Singh',
      issue: 'GPS not responding, route unclear',
      description: 'Vehicle tracking was not working for 2 hours during night shift pickup. Employees were worried about safety. GPS system needs immediate check.',
      severity: 'low',
      status: 'resolved',
      timestamp: '2025-11-08 11:00 AM',
      route: 'Maraimalai Nagar → Electronics Factory',
      location: 'Maraimalai Nagar Area'
    },
  ];

  const getSeverityBadge = (severity) => {
    switch (severity) {
      case 'high':
        return <Badge className="bg-red-500"><AlertCircle className="h-3 w-3 mr-1" />High Priority</Badge>;
      case 'medium':
        return <Badge className="bg-orange-500"><AlertCircle className="h-3 w-3 mr-1" />Medium</Badge>;
      case 'low':
        return <Badge className="bg-yellow-500"><AlertCircle className="h-3 w-3 mr-1" />Low</Badge>;
      default:
        return <Badge variant="secondary">{severity}</Badge>;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="text-orange-600 border-orange-600"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case 'investigating':
        return <Badge variant="outline" className="text-blue-600 border-blue-600"><AlertCircle className="h-3 w-3 mr-1" />Investigating</Badge>;
      case 'resolved':
        return <Badge variant="outline" className="text-green-600 border-green-600"><CheckCircle className="h-3 w-3 mr-1" />Resolved</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'border-l-orange-500';
      case 'investigating': return 'border-l-blue-500';
      case 'resolved': return 'border-l-green-500';
      default: return 'border-l-gray-500';
    }
  };

  const summaryStats = [
    { label: 'Total Complaints', value: complaints.length, color: 'bg-slate-600' },
    { label: 'Pending', value: complaints.filter(c => c.status === 'pending').length, color: 'bg-orange-500' },
    { label: 'Investigating', value: complaints.filter(c => c.status === 'investigating').length, color: 'bg-blue-500' },
    { label: 'Resolved', value: complaints.filter(c => c.status === 'resolved').length, color: 'bg-green-500' },
  ];

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-4 gap-4">
        {summaryStats.map((stat, index) => (
          <Card key={index} className="border-slate-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 mb-1">{stat.label}</p>
                  <p className="text-slate-900">{stat.value}</p>
                </div>
                <div className={`${stat.color} p-3 rounded-full`}>
                  <MessageSquare className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card className="border-slate-200">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <Select defaultValue="all">
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="investigating">Investigating</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
              </SelectContent>
            </Select>

            <Select defaultValue="all-severity">
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by Severity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-severity">All Severity</SelectItem>
                <SelectItem value="high">High Priority</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>

            <Select defaultValue="recent">
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">Most Recent</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
                <SelectItem value="severity">By Severity</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Complaints List */}
      <div className="space-y-4">
        {complaints.map((complaint) => (
          <Card key={complaint.id} className={`border-l-4 ${getStatusColor(complaint.status)} border-slate-200`}>
            <CardContent className="p-6">
              <div className="grid grid-cols-12 gap-6">
                {/* Main Content */}
                <div className="col-span-8 space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-slate-900">{complaint.issue}</h3>
                        {getSeverityBadge(complaint.severity)}
                        {getStatusBadge(complaint.status)}
                      </div>
                      <p className="text-sm text-slate-600">{complaint.complaintId} • {complaint.timestamp}</p>
                    </div>
                  </div>

                  <p className="text-slate-700">{complaint.description}</p>

                  <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-lg">
                    <div>
                      <p className="text-xs text-slate-600 mb-1">Vehicle & Driver</p>
                      <div className="flex items-center gap-2">
                        <Truck className="h-4 w-4 text-slate-400" />
                        <span className="text-sm">{complaint.vehicle}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <User className="h-4 w-4 text-slate-400" />
                        <span className="text-sm">{complaint.driver}</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-slate-600 mb-1">Route & Location</p>
                      <p className="text-sm">{complaint.route}</p>
                      <p className="text-sm text-slate-500 mt-1">{complaint.location}</p>
                    </div>
                  </div>
                </div>

                {/* Customer Details & Actions */}
                <div className="col-span-4 space-y-4">
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <p className="text-sm text-blue-900 mb-3">Customer Details</p>
                    <div className="space-y-2">
                      <p className="text-sm">{complaint.customer}</p>
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <User className="h-3 w-3" />
                        <span>{complaint.contactPerson}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Phone className="h-3 w-3" />
                        <span>{complaint.phone}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Mail className="h-3 w-3" />
                        <span className="text-xs">{complaint.email}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button className="w-full bg-[#0f172a] hover:bg-[#1e293b]" onClick={() => setSelectedComplaint(complaint.id)}>
                          <Send className="h-4 w-4 mr-2" />
                          Respond
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Respond to Complaint</DialogTitle>
                          <DialogDescription>
                            {complaint.complaintId} - {complaint.issue}
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 mt-4">
                          <div>
                            <p className="text-sm mb-2">Customer: {complaint.customer}</p>
                            <p className="text-sm text-slate-600 mb-4">{complaint.description}</p>
                          </div>
                          
                          <div className="space-y-2">
                            <label className="text-sm">Response Message</label>
                            <Textarea
                              placeholder="Type your response here..."
                              value={response}
                              onChange={(e) => setResponse(e.target.value)}
                              rows={6}
                              className="resize-none"
                            />
                          </div>

                          <div className="space-y-2">
                            <label className="text-sm">Update Status</label>
                            <Select defaultValue={complaint.status}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="investigating">Investigating</SelectItem>
                                <SelectItem value="resolved">Resolved</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="flex gap-3">
                            <Button className="flex-1 bg-[#0f172a] hover:bg-[#1e293b]">
                              Send Response
                            </Button>
                            <Button variant="outline" className="flex-1">
                              Call Customer
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>

                    <Button variant="outline" className="w-full">
                      <Phone className="h-4 w-4 mr-2" />
                      Call Customer
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
