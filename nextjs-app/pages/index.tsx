import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useViewStateContext } from '../contexts/ViewStateContext';
import { 
  Box, 
  Container, 
  Typography, 
  Card, 
  CardContent, 
  Button, 
  Grid,
  AppBar,
  Toolbar,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Alert,
  Paper,
  Divider,
  Avatar,
  Badge,
  Tooltip
} from '@mui/material';
import {
  DataObject,
  TableChart,
  AccountTree,
  Assessment,
  Storage,
  Speed,
  Menu,
  Dashboard,
  Analytics,
  Settings,
  Help,
  GitHub,
  LinkedIn,
  Twitter,
  Refresh,
  TrendingUp,
  Security,
  CloudSync,
  Code
} from '@mui/icons-material';

const Home: React.FC = () => {
  // Use view state context for persistent sidebar state
  const { sidebarOpen, setSidebarOpen } = useViewStateContext();
  
  const [mounted, setMounted] = useState(false);
  const [stats, setStats] = useState({
    totalReports: 0,
    dataSources: 0,
    lastUpdated: ''
  });

  useEffect(() => {
    // Set mounted to true on client side
    setMounted(true);
    
    // Simulate fetching stats
    const fetchStats = async () => {
      try {
        // You could fetch real stats from your API here
        setStats({
          totalReports: 15,
          dataSources: 3,
          lastUpdated: new Date().toLocaleString()
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };

    fetchStats();
  }, []);

  const menuItems = [
    { icon: <Dashboard />, text: 'Dashboard', href: '/data-lookbook' },
    { icon: <Analytics />, text: 'Analytics', href: '/analytics' },
    { icon: <Settings />, text: 'Settings', href: '/settings' },
    { icon: <Help />, text: 'Help & Docs', href: '/help' }
  ];

  return (
    <>
      <Head>
        <title>Preferio Data Lookbook - Advanced JSON Analytics</title>
        <meta name="description" content="Professional JSON data exploration and visualization platform for landfill report management" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* Navigation Bar */}
      <AppBar position="fixed" sx={{ bgcolor: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(10px)' }}>
        <Toolbar>
          <IconButton
            edge="start"
            color="primary"
            aria-label="menu"
            onClick={() => setSidebarOpen(true)}
            sx={{ mr: 2 }}
          >
            <Menu />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, color: 'text.primary' }}>
            Preferio Data Lookbook
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title="Refresh Data">
              <IconButton color="primary">
                <Refresh />
              </IconButton>
            </Tooltip>
            <Tooltip title="GitHub">
              <IconButton color="primary">
                <GitHub />
              </IconButton>
            </Tooltip>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Side Drawer */}
      <Drawer
        anchor="left"
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      >
        <Box sx={{ width: 250, p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Navigation
          </Typography>
          <List>
            {menuItems.map((item) => (
              <ListItem button key={item.text} component={Link} href={item.href}>
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItem>
            ))}
          </List>
          <Divider sx={{ my: 2 }} />
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Quick Stats
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Chip label={`${stats.totalReports} Reports`} size="small" color="primary" />
            <Chip label={`${stats.dataSources} Sources`} size="small" color="secondary" />
          </Box>
        </Box>
      </Drawer>

      {/* Main Content */}
      <Box sx={{ 
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        pt: 8 // Account for fixed AppBar
      }}>
        <Container maxWidth="lg" sx={{ py: 4 }}>
          {/* Hero Section */}
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Typography 
              variant="h2" 
              component="h1" 
              gutterBottom
              sx={{ 
                color: 'white', 
                fontWeight: 'bold',
                textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
                mb: 2
              }}
            >
              📊 Preferio Data Lookbook
            </Typography>
            <Typography 
              variant="h5" 
              sx={{ 
                color: 'rgba(255,255,255,0.9)',
                maxWidth: '700px',
                margin: '0 auto',
                textShadow: '1px 1px 2px rgba(0,0,0,0.3)',
                mb: 4
              }}
            >
              Professional JSON data exploration and visualization platform for landfill report management
            </Typography>
            
            {/* Status Banner */}
            <Alert 
              severity="success" 
              sx={{ 
                maxWidth: 500, 
                mx: 'auto', 
                mb: 4,
                bgcolor: 'rgba(255,255,255,0.1)',
                color: 'white',
                '& .MuiAlert-icon': { color: 'white' }
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                <CloudSync />
                <Typography variant="body2">
                  All systems operational{mounted && stats.lastUpdated ? ` • Last updated: ${stats.lastUpdated}` : ''}
                </Typography>
              </Box>
            </Alert>
          </Box>

          {/* Feature Cards */}
          <Grid container spacing={4} sx={{ mb: 6 }}>
            <Grid item xs={12} md={6} lg={4}>
              <Card sx={{ 
                height: '100%',
                background: 'rgba(255,255,255,0.95)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.2)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                  border: '1px solid rgba(255,255,255,0.4)'
                }
              }}>
                <CardContent sx={{ textAlign: 'center', p: 4 }}>
                  <Badge badgeContent="NEW" color="error" sx={{ mb: 2 }}>
                    <DataObject sx={{ fontSize: 60, color: 'primary.main' }} />
                  </Badge>
                  <Typography variant="h5" gutterBottom fontWeight="bold">
                    JSON Table Viewer
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph sx={{ mb: 3 }}>
                    Dynamic table that automatically renders any JSON structure with nested support, 
                    expandable rows, search & filter capabilities, and export functionality.
                  </Typography>
                  <Box sx={{ mb: 3 }}>
                    <Chip label="Nested Support" size="small" sx={{ mr: 1, mb: 1 }} />
                    <Chip label="Real-time Search" size="small" sx={{ mr: 1, mb: 1 }} />
                    <Chip label="Export CSV/JSON" size="small" sx={{ mb: 1 }} />
                  </Box>
                  <Link href="/data-lookbook" passHref>
                    <Button variant="contained" size="large" fullWidth sx={{ py: 1.5 }}>
                      Explore Tables
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6} lg={4}>
              <Card sx={{ 
                height: '100%',
                background: 'rgba(255,255,255,0.95)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.2)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                  border: '1px solid rgba(255,255,255,0.4)'
                }
              }}>
                <CardContent sx={{ textAlign: 'center', p: 4 }}>
                  <Badge badgeContent="ADVANCED" color="warning" sx={{ mb: 2 }}>
                    <AccountTree sx={{ fontSize: 60, color: 'secondary.main' }} />
                  </Badge>
                  <Typography variant="h5" gutterBottom fontWeight="bold">
                    Interactive Explorer
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph sx={{ mb: 3 }}>
                    Tree view with hierarchical display, data type highlighting, 
                    real-time editing, schema validation, and error detection.
                  </Typography>
                  <Box sx={{ mb: 3 }}>
                    <Chip label="Tree Navigation" size="small" sx={{ mr: 1, mb: 1 }} />
                    <Chip label="Live Editing" size="small" sx={{ mr: 1, mb: 1 }} />
                    <Chip label="Schema Validation" size="small" sx={{ mb: 1 }} />
                  </Box>
                  <Link href="/data-lookbook" passHref>
                    <Button variant="contained" color="secondary" size="large" fullWidth sx={{ py: 1.5 }}>
                      Explore Trees
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6} lg={4}>
              <Card sx={{ 
                height: '100%',
                background: 'rgba(255,255,255,0.95)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.2)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                  border: '1px solid rgba(255,255,255,0.4)'
                }
              }}>
                <CardContent sx={{ textAlign: 'center', p: 4 }}>
                  <Badge badgeContent="PRO" color="success" sx={{ mb: 2 }}>
                    <Assessment sx={{ fontSize: 60, color: 'success.main' }} />
                  </Badge>
                  <Typography variant="h5" gutterBottom fontWeight="bold">
                    Data Overview
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph sx={{ mb: 3 }}>
                    Comprehensive data analysis with statistics, health checks, 
                    type breakdowns, performance metrics, and quality scoring.
                  </Typography>
                  <Box sx={{ mb: 3 }}>
                    <Chip label="Health Scoring" size="small" sx={{ mr: 1, mb: 1 }} />
                    <Chip label="Type Analysis" size="small" sx={{ mr: 1, mb: 1 }} />
                    <Chip label="Performance Metrics" size="small" sx={{ mb: 1 }} />
                  </Box>
                  <Link href="/data-lookbook" passHref>
                    <Button variant="contained" color="success" size="large" fullWidth sx={{ py: 1.5 }}>
                      View Overview
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Features Section */}
          <Paper sx={{ 
            p: 4, 
            mb: 6, 
            background: 'rgba(255,255,255,0.95)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.2)'
          }}>
            <Typography variant="h4" textAlign="center" gutterBottom fontWeight="bold">
              🚀 Platform Features
            </Typography>
            <Typography variant="body1" textAlign="center" color="text.secondary" paragraph>
              Built for professionals who need powerful data exploration tools
            </Typography>
            
            <Grid container spacing={4} sx={{ mt: 2 }}>
              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56, mx: 'auto', mb: 2 }}>
                    <Storage />
                  </Avatar>
                  <Typography variant="h6" gutterBottom>Multiple Sources</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Connect to APIs, files, and databases
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Avatar sx={{ bgcolor: 'secondary.main', width: 56, height: 56, mx: 'auto', mb: 2 }}>
                    <TableChart />
                  </Avatar>
                  <Typography variant="h6" gutterBottom>Export Options</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Download as CSV, JSON, or Excel
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Avatar sx={{ bgcolor: 'success.main', width: 56, height: 56, mx: 'auto', mb: 2 }}>
                    <Speed />
                  </Avatar>
                  <Typography variant="h6" gutterBottom>Real-time Validation</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Instant schema and data validation
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Avatar sx={{ bgcolor: 'warning.main', width: 56, height: 56, mx: 'auto', mb: 2 }}>
                    <Security />
                  </Avatar>
                  <Typography variant="h6" gutterBottom>Secure & Fast</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Enterprise-grade security and performance
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>

          {/* Call to Action */}
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography variant="h5" sx={{ color: 'white', mb: 3 }}>
              Ready to explore your data?
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/data-lookbook" passHref>
                <Button 
                  variant="contained" 
                  size="large"
                  sx={{ 
                    py: 2, 
                    px: 4,
                    fontSize: '1.1rem',
                    fontWeight: 'bold',
                    boxShadow: '0 8px 20px rgba(0,0,0,0.2)'
                  }}
                >
                  Start Exploring Now
                </Button>
              </Link>
              <Link href="/help" passHref>
                <Button 
                  variant="outlined" 
                  size="large"
                  sx={{ 
                    color: 'white', 
                    borderColor: 'white',
                    py: 2,
                    px: 4,
                    fontSize: '1.1rem',
                    '&:hover': {
                      borderColor: 'white',
                      backgroundColor: 'rgba(255,255,255,0.1)'
                    }
                  }}
                >
                  View Documentation
                </Button>
              </Link>
            </Box>
          </Box>

          {/* Footer */}
          <Box sx={{ 
            textAlign: 'center', 
            py: 4,
            borderTop: '1px solid rgba(255,255,255,0.2)',
            mt: 8
          }}>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', mb: 2 }}>
              © 2025 Preferio Data Lookbook. Built with Next.js and Material-UI.
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
              <Tooltip title="GitHub Repository">
                <IconButton sx={{ color: 'rgba(255,255,255,0.8)' }}>
                  <GitHub />
                </IconButton>
              </Tooltip>
              <Tooltip title="LinkedIn">
                <IconButton sx={{ color: 'rgba(255,255,255,0.8)' }}>
                  <LinkedIn />
                </IconButton>
              </Tooltip>
              <Tooltip title="Twitter">
                <IconButton sx={{ color: 'rgba(255,255,255,0.8)' }}>
                  <Twitter />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
        </Container>
      </Box>
    </>
  );
};

export default Home;
