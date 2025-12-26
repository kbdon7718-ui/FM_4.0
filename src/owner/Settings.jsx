import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card.jsx';
import { Badge } from '../components/ui/badge.jsx';
import { Button } from '../components/ui/button.jsx';
import { Input } from '../components/ui/input.jsx';
import { Label } from '../components/ui/label.jsx';
import { Switch } from '../components/ui/switch.jsx';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs.jsx';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select.jsx';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table.jsx';
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
        <div className="w-full overflow-x-auto">
          <TabsList className="w-max min-w-full justify-start">
            <TabsTrigger value="profile" className="flex-none px-3">Profile</TabsTrigger>
            <TabsTrigger value="users" className="flex-none px-3">User Access</TabsTrigger>
            <TabsTrigger value="notifications" className="flex-none px-3">Notifications</TabsTrigger>
            <TabsTrigger value="telematics" className="flex-none px-3">Telematics</TabsTrigger>
          </TabsList>
        </div>

        {/* Profile Settings */}
        <TabsContent value="profile">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            <Card className="border-border">
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
                <Button className="w-full">
                  Update Company Info
                </Button>
              </CardContent>
            </Card>

            <Card className="border-border">
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
                <Button className="w-full">
                  Change Password
                </Button>
              </CardContent>
            </Card>
          </div>

          <Card className="border-border mt-6">
            <CardHeader>
              <CardTitle>Subscription & Billing</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-6">
                <div className="bg-success-muted p-4 rounded-lg border border-success-muted">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="h-5 w-5 text-success" />
                    <p className="text-sm text-foreground">Plan Status</p>
                  </div>
                  <p className="text-foreground">Enterprise Plan</p>
                  <p className="text-sm text-muted-foreground mt-1">Active until Dec 31, 2025</p>
                </div>
                <div className="bg-info-muted p-4 rounded-lg border border-info-muted">
                  <p className="text-sm text-foreground mb-2">Fleet Size</p>
                  <p className="text-2xl text-foreground tabular-nums">48</p>
                  <p className="text-sm text-muted-foreground mt-1">Vehicles registered</p>
                </div>
                <div className="bg-muted/30 p-4 rounded-lg border border-border">
                  <p className="text-sm text-foreground mb-2">Monthly Cost</p>
                  <p className="text-2xl text-foreground tabular-nums">₹48,000</p>
                  <p className="text-sm text-muted-foreground mt-1">₹1,000 per vehicle</p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button variant="outline">View Invoices</Button>
                <Button variant="outline">Upgrade Plan</Button>
                <Button variant="outline">Add Payment Method</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* User Access Management */}
        <TabsContent value="users">
          <Card className="border-border">
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <CardTitle>User Access Management</CardTitle>
                <Button className="sm:shrink-0">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add New User
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 md:hidden">
                {users.map((u) => (
                  <div key={u.id} className="rounded-xl border border-border bg-card p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-foreground truncate">{u.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                      </div>

                      <div className="shrink-0 text-right">
                        <Badge variant={u.role === 'Owner' ? 'default' : 'secondary'}>{u.role}</Badge>
                        <div className="mt-2">
                          {u.status === 'active' ? (
                            <span className="inline-flex items-center rounded-md border border-success-muted bg-success-muted px-2 py-1 text-xs font-semibold text-success">
                              Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center rounded-md border border-border bg-muted/30 px-2 py-1 text-xs font-semibold text-muted-foreground">
                              Inactive
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 grid grid-cols-2 gap-2">
                      <div className="rounded-lg border border-border bg-muted/20 px-3 py-2">
                        <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Last Login</p>
                        <p className="text-sm font-semibold text-foreground">{u.lastLogin}</p>
                      </div>

                      <div className="rounded-lg border border-border bg-muted/20 px-3 py-2">
                        <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Actions</p>
                        <div className="mt-1 flex items-center gap-2">
                          <Button size="sm" variant="outline" className="h-8 px-2">
                            <Edit className="h-3 w-3" />
                          </Button>
                          {u.role !== 'Owner' && (
                            <Button size="sm" variant="outline" className="h-8 px-2 text-destructive hover:text-destructive">
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="hidden md:block">
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
                          <div className="h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                            <User className="h-5 w-5" />
                          </div>
                          <span>{user.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Mail className="h-4 w-4" aria-hidden="true" />
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
                          <Badge className="bg-success text-success-foreground">Active</Badge>
                        ) : (
                          <Badge variant="secondary">Inactive</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{user.lastLogin}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="outline">
                            <Edit className="h-3 w-3" />
                          </Button>
                          {user.role !== 'Owner' && (
                            <Button size="sm" variant="outline" className="text-destructive hover:text-destructive">
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
                </Table>
              </div>

              <div className="mt-6 p-4 bg-muted/30 rounded-lg border border-border">
                <h4 className="text-sm text-foreground mb-3">Role Permissions</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-foreground mb-2">Owner</p>
                    <ul className="text-muted-foreground space-y-1 text-xs">
                      <li>• Full system access</li>
                      <li>• User management</li>
                      <li>• Financial reports</li>
                      <li>• Settings configuration</li>
                    </ul>
                  </div>
                  <div>
                    <p className="text-foreground mb-2">Supervisor</p>
                    <ul className="text-muted-foreground space-y-1 text-xs">
                      <li>• Vehicle tracking</li>
                      <li>• Fuel monitoring</li>
                      <li>• Complaint management</li>
                      <li>• Driver management</li>
                    </ul>
                  </div>
                  <div>
                    <p className="text-foreground mb-2">Operator</p>
                    <ul className="text-muted-foreground space-y-1 text-xs">
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5 text-info" />
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

            <Card className="border-border">
              <CardHeader>
                <CardTitle>Notification Channels</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-border">
                    <div className="flex items-center gap-3">
                      <Mail className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-foreground">Email Notifications</p>
                        <p className="text-xs text-muted-foreground">contact@fleetmaster.com</p>
                      </div>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-border">
                    <div className="flex items-center gap-3">
                      <Phone className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-foreground">SMS Notifications</p>
                        <p className="text-xs text-muted-foreground">+91 98765 43210</p>
                      </div>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-border">
                    <div className="flex items-center gap-3">
                      <Bell className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-foreground">Push Notifications</p>
                        <p className="text-xs text-muted-foreground">Mobile & Desktop</p>
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

                <Button className="w-full">
                  Save Preferences
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Telematics Configuration */}
        <TabsContent value="telematics">
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-info" />
                Telematics Configuration
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 mb-6">
                {telematicsConfig.map((config) => (
                  <div key={config.id} className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 items-start sm:items-center p-4 bg-muted/30 rounded-lg border border-border">
                    <div>
                      <p className="text-sm text-foreground">{config.parameter}</p>
                    </div>
                    <div>
                      <Input defaultValue={config.value} />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">{config.unit}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6">
                <div className="p-4 bg-info-muted rounded-lg border border-info-muted">
                  <div className="flex items-center gap-2 mb-3">
                    <Droplet className="h-5 w-5 text-info" />
                    <p className="text-sm text-foreground">Fuel Monitoring</p>
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

                <div className="p-4 bg-success-muted rounded-lg border border-success-muted">
                  <div className="flex items-center gap-2 mb-3">
                    <Shield className="h-5 w-5 text-success" />
                    <p className="text-sm text-foreground">Safety Features</p>
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

              <Button className="w-full">
                Save Configuration
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
