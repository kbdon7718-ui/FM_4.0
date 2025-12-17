import { Card, CardContent, CardHeader, CardTitle } from '../ui/card.jsx';
import { Badge } from '../ui/badge.jsx';
import { Button } from '../ui/button.jsx';
import { Input } from '../ui/input.jsx';
import { Label } from '../ui/label.jsx';
import { Switch } from '../ui/switch.jsx';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs.jsx';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select.jsx';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table.jsx';
import { 
  User, 
  Bell, 
  Shield, 
  MapPin, 
  Droplet,
  Mail,
  Phone,
  Edit,
  Trash2,
  UserPlus,
  CheckCircle
} from 'lucide-react';

export function Settings() {
  const users = [
    { id: 1, name: 'John Anderson', email: 'john@fleetmaster.com', role: 'Owner', status: 'active', lastLogin: '2 hours ago' },
    { id: 2, name: 'Sarah Mitchell', email: 'sarah@fleetmaster.com', role: 'Supervisor', status: 'active', lastLogin: '5 min ago' },
    { id: 3, name: 'Michael Chen', email: 'michael@fleetmaster.com', role: 'Supervisor', status: 'active', lastLogin: '1 day ago' },
    { id: 4, name: 'Emily Davis', email: 'emily@fleetmaster.com', role: 'Operator', status: 'inactive', lastLogin: '3 days ago' },
  ];

  const notificationSettings = [
    { id: 1, label: 'Vehicle Over-speeding', enabled: true },
    { id: 2, label: 'Unauthorized Stops', enabled: true },
    { id: 3, label: 'Low Fuel Alerts', enabled: true },
    { id: 4, label: 'Maintenance Reminders', enabled: true },
    { id: 5, label: 'Trip Delays', enabled: true },
    { id: 6, label: 'Customer Complaints', enabled: true },
    { id: 7, label: 'Driver Performance Issues', enabled: false },
    { id: 8, label: 'Daily Summary Reports', enabled: true },
  ];

  const telematicsConfig = [
    { id: 1, parameter: 'Over-speed Threshold', value: '80 km/h', unit: 'km/h' },
    { id: 2, parameter: 'Idle Time Alert', value: '15 min', unit: 'minutes' },
    { id: 3, parameter: 'Harsh Braking Threshold', value: '8 m/s²', unit: 'm/s²' },
    { id: 4, parameter: 'Route Deviation Alert', value: '2 km', unit: 'km' },
    { id: 5, parameter: 'Low Fuel Warning', value: '20%', unit: 'percentage' },
  ];

  return (
    <div className="space-y-6">
      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full max-w-2xl grid-cols-4">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="users">User Access</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="telematics">Telematics</TabsTrigger>
        </TabsList>

        {/* Profile Settings */}
        <TabsContent value="profile">
          <div className="grid grid-cols-2 gap-6">
            <Card className="border-slate-200">
              <CardHeader>
                <CardTitle>Company Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="company">Company Name</Label>
                  <Input id="company" defaultValue="FleetMaster Pro" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input id="address" defaultValue="123 Business Park, Chennai, Tamil Nadu" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input id="phone" defaultValue="+91 98765 43210" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input id="email" defaultValue="contact@fleetmaster.com" />
                </div>
                <Button className="w-full bg-[#0f172a] hover:bg-[#1e293b]">
                  Update Company Info
                </Button>
              </CardContent>
            </Card>

            <Card className="border-slate-200">
              <CardHeader>
                <CardTitle>Account Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input id="username" defaultValue="john.anderson" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="current-password">Current Password</Label>
                  <Input id="current-password" type="password" placeholder="••••••••" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-password">New Password</Label>
                  <Input id="new-password" type="password" placeholder="••••••••" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm Password</Label>
                  <Input id="confirm-password" type="password" placeholder="••••••••" />
                </div>
                <Button className="w-full bg-[#0f172a] hover:bg-[#1e293b]">
                  Change Password
                </Button>
              </CardContent>
            </Card>
          </div>

          <Card className="border-slate-200 mt-6">
            <CardHeader>
              <CardTitle>Subscription & Billing</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <p className="text-sm text-green-900">Plan Status</p>
                  </div>
                  <p className="text-green-900">Enterprise Plan</p>
                  <p className="text-sm text-green-700 mt-1">Active until Dec 31, 2025</p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-900 mb-2">Fleet Size</p>
                  <p className="text-2xl text-blue-900">48</p>
                  <p className="text-sm text-blue-700 mt-1">Vehicles registered</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                  <p className="text-sm text-purple-900 mb-2">Monthly Cost</p>
                  <p className="text-2xl text-purple-900">₹48,000</p>
                  <p className="text-sm text-purple-700 mt-1">₹1,000 per vehicle</p>
                </div>
              </div>
              <div className="flex gap-3">
                <Button variant="outline">View Invoices</Button>
                <Button variant="outline">Upgrade Plan</Button>
                <Button variant="outline">Add Payment Method</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* User Access Management */}
        <TabsContent value="users">
          <Card className="border-slate-200">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>User Access Management</CardTitle>
                <Button className="bg-[#0f172a] hover:bg-[#1e293b]">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add New User
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Login</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-[#0f172a] flex items-center justify-center">
                            <User className="h-5 w-5 text-white" />
                          </div>
                          <span>{user.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Mail className="h-4 w-4" />
                          {user.email}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={user.role === 'Owner' ? 'default' : 'secondary'}>
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {user.status === 'active' ? (
                          <Badge className="bg-green-500">Active</Badge>
                        ) : (
                          <Badge variant="secondary">Inactive</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-slate-600">{user.lastLogin}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="outline">
                            <Edit className="h-3 w-3" />
                          </Button>
                          {user.role !== 'Owner' && (
                            <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <div className="mt-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
                <h4 className="text-sm text-slate-900 mb-3">Role Permissions</h4>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-slate-900 mb-2">Owner</p>
                    <ul className="text-slate-600 space-y-1 text-xs">
                      <li>• Full system access</li>
                      <li>• User management</li>
                      <li>• Financial reports</li>
                      <li>• Settings configuration</li>
                    </ul>
                  </div>
                  <div>
                    <p className="text-slate-900 mb-2">Supervisor</p>
                    <ul className="text-slate-600 space-y-1 text-xs">
                      <li>• Vehicle tracking</li>
                      <li>• Fuel monitoring</li>
                      <li>• Complaint management</li>
                      <li>• Driver management</li>
                    </ul>
                  </div>
                  <div>
                    <p className="text-slate-900 mb-2">Operator</p>
                    <ul className="text-slate-600 space-y-1 text-xs">
                      <li>• View-only access</li>
                      <li>• Basic tracking</li>
                      <li>• Report generation</li>
                      <li>• No configuration access</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notification Settings */}
        <TabsContent value="notifications">
          <div className="grid grid-cols-2 gap-6">
            <Card className="border-slate-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5 text-blue-500" />
                  Alert Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {notificationSettings.map((setting) => (
                  <div key={setting.id} className="flex items-center justify-between py-2">
                    <Label htmlFor={`notification-${setting.id}`} className="cursor-pointer">
                      {setting.label}
                    </Label>
                    <Switch id={`notification-${setting.id}`} defaultChecked={setting.enabled} />
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="border-slate-200">
              <CardHeader>
                <CardTitle>Notification Channels</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Mail className="h-5 w-5 text-slate-600" />
                      <div>
                        <p className="text-sm">Email Notifications</p>
                        <p className="text-xs text-slate-600">contact@fleetmaster.com</p>
                      </div>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Phone className="h-5 w-5 text-slate-600" />
                      <div>
                        <p className="text-sm">SMS Notifications</p>
                        <p className="text-xs text-slate-600">+91 98765 43210</p>
                      </div>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Bell className="h-5 w-5 text-slate-600" />
                      <div>
                        <p className="text-sm">Push Notifications</p>
                        <p className="text-xs text-slate-600">Mobile & Desktop</p>
                      </div>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Notification Frequency</Label>
                  <Select defaultValue="immediate">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="immediate">Immediate</SelectItem>
                      <SelectItem value="hourly">Hourly Digest</SelectItem>
                      <SelectItem value="daily">Daily Summary</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button className="w-full bg-[#0f172a] hover:bg-[#1e293b]">
                  Save Preferences
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Telematics Configuration */}
        <TabsContent value="telematics">
          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-blue-500" />
                Telematics Configuration
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 mb-6">
                {telematicsConfig.map((config) => (
                  <div key={config.id} className="grid grid-cols-3 gap-4 items-center p-4 bg-slate-50 rounded-lg">
                    <div>
                      <p className="text-sm text-slate-900">{config.parameter}</p>
                    </div>
                    <div>
                      <Input defaultValue={config.value} className="bg-white" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-600">{config.unit}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-6 mb-6">
                <div className="p-4 bg-cyan-50 rounded-lg border border-cyan-200">
                  <div className="flex items-center gap-2 mb-3">
                    <Droplet className="h-5 w-5 text-cyan-600" />
                    <p className="text-sm text-cyan-900">Fuel Monitoring</p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="fuel-tracking" className="text-sm">Real-time Fuel Tracking</Label>
                      <Switch id="fuel-tracking" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="fuel-theft" className="text-sm">Fuel Theft Detection</Label>
                      <Switch id="fuel-theft" defaultChecked />
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center gap-2 mb-3">
                    <Shield className="h-5 w-5 text-green-600" />
                    <p className="text-sm text-green-900">Safety Features</p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="speed-governor" className="text-sm">Speed Governor</Label>
                      <Switch id="speed-governor" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="panic-button" className="text-sm">Panic Button Alert</Label>
                      <Switch id="panic-button" defaultChecked />
                    </div>
                  </div>
                </div>
              </div>

              <Button className="w-full bg-[#0f172a] hover:bg-[#1e293b]">
                Save Configuration
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
