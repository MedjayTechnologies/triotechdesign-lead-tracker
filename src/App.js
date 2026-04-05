/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import { Plus, X, TrendingUp, IndianRupee, Target, Award, Briefcase, Bell, CheckCircle, XCircle, AlertCircle, FolderKanban, User, Phone, Mail, Building2, ArrowRight, Eye } from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set, onValue, remove, push } from 'firebase/database';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC3pMi-QH9T1B3sIqWrti_J-ZxkWTXkPMo",
  authDomain: "trio-techdesign-lead-tracker.firebaseapp.com",
  databaseURL: "https://trio-techdesign-lead-tracker-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "trio-techdesign-lead-tracker",
  storageBucket: "trio-techdesign-lead-tracker.firebasestorage.app",
  messagingSenderId: "604647650615",
  appId: "1:604647650615:web:50bede08dcf98d8fb216b2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

const TrioTechdesignPipeline = () => {
  // Main navigation
  const [activeTab, setActiveTab] = useState('leads'); // 'leads', 'deals', or 'projects'
  
  // Leads state
  const [leads, setLeads] = useState([]);
  const [owners, setOwners] = useState(['Naveen', 'Arjun', 'Priyankur', 'Gowtham', 'Gibson', 'Devi']);
  const [showAddLead, setShowAddLead] = useState(false);
  const [showAddOwner, setShowAddOwner] = useState(false);
  const [editingLead, setEditingLead] = useState(null);
  const [filterLeadStatus, setFilterLeadStatus] = useState('new');
  const [leadSearchTerm, setLeadSearchTerm] = useState('');
  const [viewingLead, setViewingLead] = useState(null);
  const [newLead, setNewLead] = useState({
    title: '',
    contactName: '',
    phone: '',
    email: '',
    company: '',
    owner: '',
    value: '',
    notes: ''
  });
  const [editLead, setEditLead] = useState({
    title: '',
    contactName: '',
    phone: '',
    email: '',
    company: '',
    owner: '',
    value: '',
    notes: ''
  });
  const [newOwnerName, setNewOwnerName] = useState('');

  // Deals state
  const [deals, setDeals] = useState([]);
  const [showAddDeal, setShowAddDeal] = useState(false);
  const [editingDeal, setEditingDeal] = useState(null);
  const [filterDealStatus, setFilterDealStatus] = useState('proposal_sent');
  const [dealSearchTerm, setDealSearchTerm] = useState('');
  const [viewingDeal, setViewingDeal] = useState(null);
  const [newDeal, setNewDeal] = useState({
    title: '',
    clientName: '',
    contactPerson: '',
    phone: '',
    email: '',
    owner: '',
    value: '',
    proposalDate: '',
    expectedCloseDate: '',
    notes: ''
  });
  const [editDeal, setEditDeal] = useState({
    title: '',
    clientName: '',
    contactPerson: '',
    phone: '',
    email: '',
    owner: '',
    value: '',
    proposalDate: '',
    expectedCloseDate: '',
    notes: ''
  });


  // Projects state
  const [projects, setProjects] = useState([]);
  const [showAddProject, setShowAddProject] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [projectSearchTerm, setProjectSearchTerm] = useState('');
  const [newProject, setNewProject] = useState({
    title: '',
    description: '',
    status: 'planning',
    owner: '',
    startDate: '',
    endDate: ''
  });
  const [editProject, setEditProject] = useState({
    title: '',
    description: '',
    status: 'planning',
    owner: '',
    startDate: '',
    endDate: ''
  });

  // Notifications state
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Real-time listener for leads
  useEffect(() => {
    const leadsRef = ref(database, 'leads');
    const unsubscribe = onValue(leadsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const leadsArray = Object.keys(data).map(key => ({
          ...data[key],
          id: key
        }));
        
        // Check for owner changes to trigger notifications
        const previousLeads = leads;
        leadsArray.forEach(newLead => {
          const oldLead = previousLeads.find(l => l.id === newLead.id);
          if (oldLead && oldLead.owner !== newLead.owner) {
            addNotification({
              type: 'lead_reassigned',
              message: `Lead "${newLead.title}" reassigned from ${oldLead.owner} to ${newLead.owner}`,
              leadId: newLead.id,
              timestamp: new Date().toISOString()
            });
          }
        });
        
        setLeads(leadsArray);
      } else {
        setLeads([]);
      }
    });

    return () => unsubscribe();
  }, []);

  // Real-time listener for owners
  useEffect(() => {
    const ownersRef = ref(database, 'owners');
    const unsubscribe = onValue(ownersRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setOwners(data);
      }
    });

    return () => unsubscribe();
  }, []);

  // Real-time listener for deals
  useEffect(() => {
    const dealsRef = ref(database, 'deals');
    const unsubscribe = onValue(dealsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const dealsArray = Object.keys(data).map(key => ({
          ...data[key],
          id: key
        }));
        setDeals(dealsArray);
      } else {
        setDeals([]);
      }
    });

    return () => unsubscribe();
  }, []);

  // Real-time listener for projects
  useEffect(() => {
    const projectsRef = ref(database, 'projects');
    const unsubscribe = onValue(projectsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const projectsArray = Object.keys(data).map(key => ({
          ...data[key],
          id: key
        }));
        setProjects(projectsArray);
      } else {
        setProjects([]);
      }
    });

    return () => unsubscribe();
  }, []);

  // Real-time listener for notifications
  useEffect(() => {
    const notificationsRef = ref(database, 'notifications');
    const unsubscribe = onValue(notificationsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const notificationsArray = Object.keys(data).map(key => ({
          ...data[key],
          id: key
        })).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        setNotifications(notificationsArray);
        setUnreadCount(notificationsArray.filter(n => !n.read).length);
      } else {
        setNotifications([]);
        setUnreadCount(0);
      }
    });

    return () => unsubscribe();
  }, []);

  const addNotification = async (notification) => {
    try {
      const notificationsRef = ref(database, 'notifications');
      const newNotificationRef = push(notificationsRef);
      await set(newNotificationRef, {
        ...notification,
        read: false,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error adding notification:', error);
    }
  };

  const markNotificationAsRead = async (notificationId) => {
    try {
      const notificationRef = ref(database, `notifications/${notificationId}`);
      const notification = notifications.find(n => n.id === notificationId);
      if (notification) {
        await set(notificationRef, { ...notification, read: true });
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const clearAllNotifications = async () => {
    try {
      const notificationsRef = ref(database, 'notifications');
      await remove(notificationsRef);
    } catch (error) {
      console.error('Error clearing notifications:', error);
    }
  };

  const addLead = async () => {
    if (!newLead.title || !newLead.contactName || !newLead.owner || !newLead.value) {
      alert('Please fill all required fields (title, contact name, owner, and value)');
      return;
    }

    try {
      const leadId = Date.now().toString();
      const lead = {
        title: newLead.title,
        owner: newLead.owner,
        value: parseFloat(newLead.value),
        notes: newLead.notes,
        status: 'new',
        createdAt: new Date().toISOString(),
        statusHistory: [{
          status: 'new',
          timestamp: new Date().toISOString()
        }]
      };

      const leadRef = ref(database, `leads/${leadId}`);
      await set(leadRef, lead);
      
      // Add notification for new lead assignment
      await addNotification({
        type: 'lead_assigned',
        message: `New lead "${newLead.title}" assigned to ${newLead.owner}`,
        leadId: leadId
      });
      
      setNewLead({ title: '', contactName: '', phone: '', email: '', company: '', owner: '', value: '', notes: '' });
      setShowAddLead(false);
      alert('Lead added successfully!');
    } catch (error) {
      console.error('Error adding lead:', error);
      alert('Error adding lead: ' + error.message);
    }
  };

  const addOwner = async () => {
    if (!newOwnerName.trim()) return;
    if (owners.includes(newOwnerName.trim())) {
      alert('Owner already exists!');
      return;
    }

    try {
      const updatedOwners = [...owners, newOwnerName.trim()];
      const ownersRef = ref(database, 'owners');
      await set(ownersRef, updatedOwners);
      
      setNewOwnerName('');
      setShowAddOwner(false);
      alert('Owner added successfully!');
    } catch (error) {
      console.error('Error adding owner:', error);
      alert('Error adding owner: ' + error.message);
    }
  };

  const deleteOwner = async (ownerName) => {
    if (owners.length <= 1) {
      alert('Cannot delete the last owner!');
      return;
    }
    
    if (!window.confirm(`Are you sure you want to delete "${ownerName}"? This cannot be undone.`)) {
      return;
    }

    try {
      const updatedOwners = owners.filter(o => o !== ownerName);
      const ownersRef = ref(database, 'owners');
      await set(ownersRef, updatedOwners);
      alert('Owner deleted!');
    } catch (error) {
      console.error('Error deleting owner:', error);
      alert('Error deleting owner: ' + error.message);
    }
  };

  // Convert Lead to Deal
  const convertLeadToDeal = (lead) => {
    setNewDeal({
      title: lead.title,
      clientName: lead.company || '',
      contactPerson: lead.contactName,
      phone: lead.phone || '',
      email: lead.email || '',
      owner: lead.owner,
      value: '',
      proposalDate: '',
      expectedCloseDate: '',
      notes: lead.notes || ''
    });
    setActiveTab('deals');
    setShowAddDeal(true);
  };

  // Deal CRUD Functions
  const addDeal = async () => {
    if (!newDeal.title || !newDeal.owner || !newDeal.value) {
      alert('Please fill title, owner, and value');
      return;
    }
    try {
      const dealId = Date.now().toString();
      const deal = { 
        ...newDeal, 
        value: parseFloat(newDeal.value), 
        status: 'proposal_sent', 
        createdAt: new Date().toISOString() 
      };
      await set(ref(database, `deals/${dealId}`), deal);
      await addNotification({ 
        type: 'deal_created', 
        message: `New deal "${newDeal.title}" - ₹${parseFloat(newDeal.value).toLocaleString('en-IN')}`, 
        dealId 
      });
      setNewDeal({ title: '', clientName: '', contactPerson: '', phone: '', email: '', owner: '', value: '', proposalDate: '', expectedCloseDate: '', notes: '' });
      setShowAddDeal(false);
      alert('Deal added!');
    } catch (error) {
      alert('Error: ' + error.message);
    }
  };

  const updateDeal = async () => {
    if (!editDeal.title || !editDeal.owner || !editDeal.value) {
      alert('Please fill required fields');
      return;
    }
    try {
      const updatedDeal = {
        ...editingDeal,
        ...editDeal,
        value: parseFloat(editDeal.value),
        updatedAt: new Date().toISOString()
      };
      await set(ref(database, `deals/${editingDeal.id}`), updatedDeal);
      setEditingDeal(null);
      setEditDeal({ title: '', clientName: '', contactPerson: '', phone: '', email: '', owner: '', value: '', proposalDate: '', expectedCloseDate: '', notes: '' });
      alert('Deal updated!');
    } catch (error) {
      alert('Error: ' + error.message);
    }
  };

  const updateDealStatus = async (dealId, newStatus) => {
    try {
      const deal = deals.find(d => d.id === dealId);
      if (deal) {
        await set(ref(database, `deals/${dealId}`), { ...deal, status: newStatus, updatedAt: new Date().toISOString() });
        if (newStatus === 'won') {
          await addNotification({ 
            type: 'deal_won', 
            message: `Deal "${deal.title}" WON! ₹${deal.value.toLocaleString('en-IN')}`, 
            dealId 
          });
        }
      }
    } catch (error) {
      alert('Error: ' + error.message);
    }
  };

  const deleteDeal = async (dealId) => {
    if (window.confirm('Delete this deal?')) {
      try {
        await remove(ref(database, `deals/${dealId}`));
      } catch (error) {
        alert('Error: ' + error.message);
      }
    }
  };

  const openEditModal = (lead) => {
    setEditingLead(lead);
    setEditLead({
      title: lead.title,
      contactName: lead.contactName || '',
      phone: lead.phone || '',
      email: lead.email || '',
      company: lead.company || '',
      owner: lead.owner,
      value: lead.value.toString(),
      notes: lead.notes || ''
    });
  };

  const updateLead = async () => {
    if (!editLead.title || !editLead.contactName || !editLead.owner || !editLead.value) {
      alert('Please fill all required fields (title, contact name, owner, and value)');
      return;
    }

    try {
      const ownerChanged = editingLead.owner !== editLead.owner;
      
      const updatedLead = {
        ...editingLead,
        title: editLead.title,
        contactName: editLead.contactName,
        phone: editLead.phone,
        email: editLead.email,
        company: editLead.company,
        owner: editLead.owner,
        value: parseFloat(editLead.value),
        notes: editLead.notes,
        updatedAt: new Date().toISOString()
      };

      const leadRef = ref(database, `leads/${editingLead.id}`);
      await set(leadRef, updatedLead);
      
      // Add notification if owner changed
      if (ownerChanged) {
        await addNotification({
          type: 'lead_reassigned',
          message: `Lead "${editLead.title}" reassigned from ${editingLead.owner} to ${editLead.owner}`,
          leadId: editingLead.id
        });
      }
      
      setEditingLead(null);
      setEditLead({ title: '', contactName: '', phone: '', email: '', company: '', owner: '', value: '', notes: '' });
      alert('Lead updated successfully!');
    } catch (error) {
      console.error('Error updating lead:', error);
      alert('Error updating lead: ' + error.message);
    }
  };

  const updateLeadStatus = async (leadId, newStatus) => {
    try {
      const lead = leads.find(l => l.id === leadId);
      if (!lead) return;

      const updatedLead = {
        ...lead,
        status: newStatus,
        updatedAt: new Date().toISOString()
      };

      // Auto-track dates when status changes
      if (newStatus === 'contacted' && !lead.contactedDate) {
        updatedLead.contactedDate = new Date().toISOString();
      }
      if (newStatus === 'qualified' && !lead.qualifiedDate) {
        updatedLead.qualifiedDate = new Date().toISOString();
      }
      if (newStatus === 'po_received' && !lead.poReceivedDate) {
        updatedLead.poReceivedDate = new Date().toISOString();
      }

      const leadRef = ref(database, `leads/${leadId}`);
      await set(leadRef, updatedLead);
      
      // Add notification for key status changes
      if (newStatus === 'po_received') {
        await addNotification({
          type: 'lead_status_changed',
          message: `🎉 PO Received for "${lead.title}"!`,
          leadId: leadId
        });
      }
    } catch (error) {
      console.error('Error updating lead status:', error);
      alert('Error updating lead: ' + error.message);
    }
  };

  const deleteLead = async (leadId) => {
    if (!window.confirm('Are you sure you want to delete this lead?')) return;
    
    try {
      const leadRef = ref(database, `leads/${leadId}`);
      await remove(leadRef);
    } catch (error) {
      console.error('Error deleting lead:', error);
      alert('Error deleting lead: ' + error.message);
    }
  };

  // Project functions
  const addProject = async () => {
    if (!newProject.title || !newProject.owner) {
      alert('Please fill title and owner fields');
      return;
    }

    try {
      const projectId = Date.now().toString();
      const project = {
        ...newProject,
        createdAt: new Date().toISOString()
      };

      const projectRef = ref(database, `projects/${projectId}`);
      await set(projectRef, project);
      
      await addNotification({
        type: 'project_created',
        message: `New project "${newProject.title}" created`,
        projectId: projectId
      });
      
      setNewProject({ title: '', description: '', status: 'planning', owner: '', startDate: '', endDate: '' });
      setShowAddProject(false);
      alert('Project added successfully!');
    } catch (error) {
      console.error('Error adding project:', error);
      alert('Error adding project: ' + error.message);
    }
  };

  const openEditProjectModal = (project) => {
    setEditingProject(project);
    setEditProject({
      title: project.title,
      description: project.description || '',
      status: project.status,
      owner: project.owner,
      startDate: project.startDate || '',
      endDate: project.endDate || ''
    });
  };

  const updateProject = async () => {
    if (!editProject.title || !editProject.owner) {
      alert('Please fill title and owner fields');
      return;
    }

    try {
      const updatedProject = {
        ...editingProject,
        ...editProject,
        updatedAt: new Date().toISOString()
      };

      const projectRef = ref(database, `projects/${editingProject.id}`);
      await set(projectRef, updatedProject);
      
      setEditingProject(null);
      setEditProject({ title: '', description: '', status: 'planning', owner: '', startDate: '', endDate: '' });
      alert('Project updated successfully!');
    } catch (error) {
      console.error('Error updating project:', error);
      alert('Error updating project: ' + error.message);
    }
  };

  const deleteProject = async (projectId) => {
    if (!window.confirm('Are you sure you want to delete this project?')) return;
    
    try {
      const projectRef = ref(database, `projects/${projectId}`);
      await remove(projectRef);
    } catch (error) {
      console.error('Error deleting project:', error);
      alert('Error deleting project: ' + error.message);
    }
  };

  const getFilteredLeads = () => {
    return leads
      .filter(lead => lead.status === filterLeadStatus)
      .filter(lead => 
        lead.title.toLowerCase().includes(leadSearchTerm.toLowerCase()) ||
        lead.owner.toLowerCase().includes(leadSearchTerm.toLowerCase())
      );
  };

  const getFilteredProjects = () => {
    return projects.filter(project =>
      project.title.toLowerCase().includes(projectSearchTerm.toLowerCase()) ||
      project.description?.toLowerCase().includes(projectSearchTerm.toLowerCase()) ||
      project.owner.toLowerCase().includes(projectSearchTerm.toLowerCase())
    );
  };

  const getLeadStats = () => ({
    new: leads.filter(l => l.status === 'new').length,
    contacted: leads.filter(l => l.status === 'contacted').length,
    qualified: leads.filter(l => l.status === 'qualified').length,
    poReceived: leads.filter(l => l.status === 'po_received').length,
    dead: leads.filter(l => l.status === 'dead').length,
    total: leads.length
  });

  const getDealStats = () => ({
    proposalSent: deals.filter(d => d.status === 'proposal_sent').length,
    negotiation: deals.filter(d => d.status === 'negotiation').length,
    won: deals.filter(d => d.status === 'won').length,
    lost: deals.filter(d => d.status === 'lost').length,
    activeValue: deals.filter(d => ['proposal_sent', 'negotiation'].includes(d.status)).reduce((sum, d) => sum + (d.value || 0), 0)
  });

  const getProjectStats = () => ({
    planning: projects.filter(p => p.status === 'planning').length,
    inProgress: projects.filter(p => p.status === 'in_progress').length,
    completed: projects.filter(p => p.status === 'completed').length,
    onHold: projects.filter(p => p.status === 'on_hold').length
  });

  const leadStats = getLeadStats();
  const dealStats = getDealStats();
  const projectStats = getProjectStats();
  const filteredLeads = getFilteredLeads();
  const filteredDeals = deals
    .filter(d => d.status === filterDealStatus)
    .filter(d => {
      if (!dealSearchTerm) return true;
      return d.title?.toLowerCase().includes(dealSearchTerm.toLowerCase()) || 
             d.clientName?.toLowerCase().includes(dealSearchTerm.toLowerCase());
    });
  const filteredProjects = getFilteredProjects();

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap');
        
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
          font-family: 'Poppins', sans-serif;
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        .animate-slide-up {
          animation: slideUp 0.5s ease-out;
        }

        .animate-fade-in {
          animation: fadeIn 0.3s ease-out;
        }

        .animate-scale-in {
          animation: scaleIn 0.3s ease-out;
        }

        .glass-card {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          border-radius: 20px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.18);
        }

        .stat-card {
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.7) 100%);
          backdrop-filter: blur(10px);
          border-radius: 16px;
          padding: 18px;
          transition: all 0.3s ease;
          border: 2px solid rgba(255, 255, 255, 0.5);
        }

        .stat-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
        }

        .lead-card {
          background: white;
          border-radius: 16px;
          padding: 16px;
          margin-bottom: 12px;
          transition: all 0.3s ease;
          border-left: 4px solid #667eea;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
        }

        .lead-card:hover {
          transform: translateX(8px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
        }

        .btn-primary {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
          font-size: 14px;
        }

        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
        }

        .btn-success {
          background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 10px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 13px;
        }

        .btn-success:hover {
          transform: scale(1.05);
          box-shadow: 0 4px 15px rgba(56, 239, 125, 0.4);
        }

        .btn-danger {
          background: linear-gradient(135deg, #eb3349 0%, #f45c43 100%);
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 10px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 13px;
        }

        .btn-danger:hover {
          transform: scale(1.05);
          box-shadow: 0 4px 15px rgba(244, 92, 67, 0.4);
        }

        .btn-warning {
          background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 10px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 13px;
        }

        .btn-warning:hover {
          transform: scale(1.05);
          box-shadow: 0 4px 15px rgba(245, 87, 108, 0.4);
        }

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.7);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          backdrop-filter: blur(5px);
        }

        .modal-content {
          background: white;
          border-radius: 24px;
          padding: 32px;
          max-width: 500px;
          width: 90%;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        }

        .input-field {
          width: 100%;
          padding: 10px 14px;
          border: 2px solid #e0e0e0;
          border-radius: 12px;
          font-size: 14px;
          transition: all 0.3s ease;
          font-family: 'Poppins', sans-serif;
        }

        .input-field:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
        }

        .tab-button {
          padding: 8px 18px;
          border-radius: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          border: 2px solid transparent;
          background: rgba(255, 255, 255, 0.5);
          font-size: 14px;
        }

        .tab-button.active {
          background: white;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 4px 10px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 600;
        }

        .badge-primary {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }

        .badge-success {
          background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
          color: white;
        }

        .badge-danger {
          background: linear-gradient(135deg, #eb3349 0%, #f45c43 100%);
          color: white;
        }

        .badge-warning {
          background: linear-gradient(135deg, #ffa751 0%, #ffe259 100%);
          color: #333;
        }

        .sync-indicator {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 8px 16px;
          background: rgba(255, 255, 255, 0.95);
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          color: #11998e;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
        }

        .sync-dot {
          width: 8px;
          height: 8px;
          background: #38ef7d;
          border-radius: 50%;
          animation: pulse 2s ease-in-out infinite;
        }

        .notification-badge {
          position: absolute;
          top: -6px;
          right: -6px;
          background: #eb3349;
          color: white;
          border-radius: 50%;
          width: 20px;
          height: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 11px;
          font-weight: 700;
        }

        .notification-item {
          padding: 12px;
          border-radius: 8px;
          margin-bottom: 8px;
          cursor: pointer;
          transition: all 0.3s ease;
          border-left: 3px solid #667eea;
        }

        .notification-item:hover {
          background: #f5f5f5;
        }

        .notification-item.unread {
          background: rgba(102, 126, 234, 0.1);
        }
      `}</style>

      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '30px 20px' }}>
        {/* Header */}
        <div className="animate-slide-up" style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: '42px', fontWeight: '800', color: 'white', marginBottom: '4px', textShadow: '0 4px 20px rgba(0,0,0,0.2)', letterSpacing: '1px' }}>
              TRIO TECHDESIGN
            </h1>
            <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.9)', fontWeight: '500', marginBottom: '8px' }}>
              {activeTab === 'leads' ? 'Lead Management' : activeTab === 'deals' ? 'Deal Pipeline' : 'Project Management'}
            </p>
            
            {/* Real-time sync indicator */}
            <div className="sync-indicator">
              <div className="sync-dot"></div>
              <span>Real-time Team Sync Active</span>
            </div>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {/* Notification Bell */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                style={{
                  background: 'rgba(255, 255, 255, 0.2)',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  position: 'relative'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'}
              >
                <Bell size={20} color="white" />
                {unreadCount > 0 && (
                  <div className="notification-badge">{unreadCount}</div>
                )}
              </button>

              {/* Notifications Dropdown */}
              {showNotifications && (
                <div style={{
                  position: 'absolute',
                  top: '60px',
                  right: '0',
                  background: 'white',
                  borderRadius: '16px',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
                  width: '350px',
                  maxHeight: '400px',
                  overflowY: 'auto',
                  zIndex: 1001
                }} className="animate-scale-in">
                  <div style={{ padding: '16px', borderBottom: '1px solid #e0e0e0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#333' }}>Notifications</h3>
                    {notifications.length > 0 && (
                      <button
                        onClick={clearAllNotifications}
                        style={{ fontSize: '12px', color: '#667eea', background: 'none', border: 'none', cursor: 'pointer', fontWeight: '600' }}
                      >
                        Clear All
                      </button>
                    )}
                  </div>
                  <div style={{ padding: '8px' }}>
                    {notifications.length === 0 ? (
                      <div style={{ padding: '32px', textAlign: 'center', color: '#999' }}>
                        <Bell size={32} style={{ margin: '0 auto 8px', opacity: 0.3 }} />
                        <p style={{ fontSize: '14px' }}>No notifications</p>
                      </div>
                    ) : (
                      notifications.map(notification => (
                        <div
                          key={notification.id}
                          className={`notification-item ${!notification.read ? 'unread' : ''}`}
                          onClick={() => markNotificationAsRead(notification.id)}
                        >
                          <div style={{ fontSize: '13px', color: '#333', marginBottom: '4px' }}>
                            {notification.message}
                          </div>
                          <div style={{ fontSize: '11px', color: '#999' }}>
                            {new Date(notification.timestamp).toLocaleString('en-IN')}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Logo */}
            <img 
              src="trio-techdesign-logo.png" 
              alt="Medjay Logo" 
              style={{ 
                width: '80px', 
                height: '80px',
                filter: 'drop-shadow(0 4px 15px rgba(0,0,0,0.3))',
                animation: 'float 3s ease-in-out infinite'
              }} 
            />
          </div>
        </div>

        {/* Main Navigation Tabs */}
        <div style={{ marginBottom: '24px', display: 'flex', gap: '12px' }}>
          <button
            onClick={() => setActiveTab('leads')}
            className={`tab-button ${activeTab === 'leads' ? 'active' : ''}`}
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <User size={16} />
            Leads ({leadStats.total})
          </button>
          <button
            onClick={() => setActiveTab('deals')}
            className={`tab-button ${activeTab === 'deals' ? 'active' : ''}`}
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Target size={16} />
            Deals ({dealStats.proposalSent + dealStats.negotiation})
          </button>
          <button
            onClick={() => setActiveTab('projects')}
            className={`tab-button ${activeTab === 'projects' ? 'active' : ''}`}
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <FolderKanban size={16} />
            Projects
          </button>
        </div>

        {/* LEADS TAB */}
        {activeTab === 'leads' && (
          <>
            {/* Stats Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }} className="animate-slide-up">
              <div className="stat-card">
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', padding: '10px', borderRadius: '10px' }}>
                    <User size={20} color="white" />
                  </div>
                  <div>
                    <div style={{ fontSize: '22px', fontWeight: '800', color: '#333' }}>{leadStats.new}</div>
                    <div style={{ fontSize: '11px', color: '#666', fontWeight: '600' }}>New Leads</div>
                  </div>
                </div>
              </div>

              <div className="stat-card">
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', padding: '10px', borderRadius: '10px' }}>
                    <Phone size={20} color="white" />
                  </div>
                  <div>
                    <div style={{ fontSize: '22px', fontWeight: '800', color: '#333' }}>{leadStats.contacted}</div>
                    <div style={{ fontSize: '11px', color: '#666', fontWeight: '600' }}>Contacted</div>
                  </div>
                </div>
              </div>

              <div className="stat-card">
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)', padding: '10px', borderRadius: '10px' }}>
                    <CheckCircle size={20} color="white" />
                  </div>
                  <div>
                    <div style={{ fontSize: '22px', fontWeight: '800', color: '#333' }}>{leadStats.qualified}</div>
                    <div style={{ fontSize: '11px', color: '#666', fontWeight: '600' }}>Qualified</div>
                  </div>
                </div>
              </div>

              <div className="stat-card">
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ background: 'linear-gradient(135deg, #ffa751 0%, #ffe259 100%)', padding: '10px', borderRadius: '10px' }}>
                    <Award size={20} color="white" />
                  </div>
                  <div>
                    <div style={{ fontSize: '22px', fontWeight: '800', color: '#333' }}>{leadStats.poReceived}</div>
                    <div style={{ fontSize: '11px', color: '#666', fontWeight: '600' }}>PO Received</div>
                  </div>
                </div>
              </div>

              <div className="stat-card">
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ background: 'linear-gradient(135deg, #eb3349 0%, #f45c43 100%)', padding: '10px', borderRadius: '10px' }}>
                    <TrendingUp size={20} color="white" />
                  </div>
                  <div>
                    <div style={{ fontSize: '22px', fontWeight: '800', color: '#333' }}>{leadStats.total}</div>
                    <div style={{ fontSize: '11px', color: '#666', fontWeight: '600' }}>Total Leads</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content Card - Leads */}
            <div className="glass-card animate-scale-in" style={{ padding: '24px' }}>
              {/* Controls */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <button
                    onClick={() => setFilterLeadStatus('new')}
                    className={`tab-button ${filterLeadStatus === 'new' ? 'active' : ''}`}
                  >
                    New ({leadStats.new})
                  </button>
                  <button
                    onClick={() => setFilterLeadStatus('contacted')}
                    className={`tab-button ${filterLeadStatus === 'contacted' ? 'active' : ''}`}
                  >
                    Contacted ({leadStats.contacted})
                  </button>
                  <button
                    onClick={() => setFilterLeadStatus('qualified')}
                    className={`tab-button ${filterLeadStatus === 'qualified' ? 'active' : ''}`}
                  >
                    Qualified ({leadStats.qualified})
                  </button>
                  <button
                    onClick={() => setFilterLeadStatus('po_received')}
                    className={`tab-button ${filterLeadStatus === 'po_received' ? 'active' : ''}`}
                  >
                    PO Received ({leadStats.poReceived})
                  </button>
                  <button
                    onClick={() => setFilterLeadStatus('dead')}
                    className={`tab-button ${filterLeadStatus === 'dead' ? 'active' : ''}`}
                  >
                    Dead ({leadStats.dead})
                  </button>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button onClick={() => setShowAddLead(true)} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Plus size={16} />
                    Add Lead
                  </button>
                </div>
              </div>

              {/* Search */}
              <div style={{ marginBottom: '20px' }}>
                <input
                  type="text"
                  placeholder="Search leads..."
                  value={leadSearchTerm}
                  onChange={(e) => setLeadSearchTerm(e.target.value)}
                  className="input-field"
                />
              </div>

              {/* Leads List */}
              <div>
                {filteredLeads.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '60px 20px', color: '#999' }}>
                    <Target size={48} style={{ margin: '0 auto 16px', opacity: 0.3 }} />
                    <p style={{ fontSize: '18px', fontWeight: '600' }}>No {filterLeadStatus} leads found</p>
                    <p style={{ fontSize: '14px', marginTop: '8px' }}>
                      {leadSearchTerm ? 'Try adjusting your search' : 'Click "Add Lead" to get started'}
                    </p>
                  </div>
                ) : (
                  filteredLeads.map((lead) => (
                    <div key={lead.id} className="lead-card animate-fade-in">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '10px' }}>
                        <div style={{ flex: 1 }}>
                          <h3 style={{ fontSize: '17px', fontWeight: '700', color: '#333', marginBottom: '6px' }}>
                            {lead.title}
                          </h3>
                          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '6px' }}>
                            <span className="badge badge-primary">{lead.owner}</span>
                            <span className="badge" style={{ background: '#f0f0f0', color: '#333' }}>
                              ₹{lead.value.toLocaleString('en-IN')}
                            </span>
                            <span className={`badge ${
                              lead.status === 'won' ? 'badge-success' : 
                              lead.status === 'lost' ? 'badge-danger' : 
                              lead.status === 'abandoned' ? 'badge-warning' : 
                              'badge-primary'
                            }`} style={{ textTransform: 'uppercase' }}>
                              {lead.status}
                            </span>
                          </div>
                          
                          {/* Contact Information */}
                          {(lead.contactName || lead.phone || lead.email || lead.company) && (
                            <div style={{ fontSize: '13px', color: '#666', marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                              {lead.contactName && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                  <User size={14} />
                                  <span><strong>Contact:</strong> {lead.contactName}</span>
                                </div>
                              )}
                              {lead.phone && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                  <Phone size={14} />
                                  <span>{lead.phone}</span>
                                </div>
                              )}
                              {lead.email && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                  <Mail size={14} />
                                  <span>{lead.email}</span>
                                </div>
                              )}
                              {lead.company && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                  <Building2 size={14} />
                                  <span>{lead.company}</span>
                                </div>
                              )}
                            </div>
                          )}
                          
                          {lead.notes && (
                            <p style={{ fontSize: '13px', color: '#666', marginTop: '8px', fontStyle: 'italic' }}>"{lead.notes}"</p>
                          )}
                          <div style={{ fontSize: '11px', color: '#999', marginTop: '6px' }}>
                            Created: {new Date(lead.createdAt).toLocaleDateString('en-IN')}
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: '6px', marginLeft: '12px' }}>
                          <button
                            onClick={() => setViewingLead(lead)}
                            style={{ 
                              background: 'transparent', 
                              border: '1px solid #4facfe', 
                              color: '#4facfe',
                              cursor: 'pointer', 
                              padding: '6px 12px', 
                              borderRadius: '8px', 
                              transition: 'all 0.3s',
                              fontSize: '12px',
                              fontWeight: '600',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = '#4facfe';
                              e.currentTarget.style.color = 'white';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = 'transparent';
                              e.currentTarget.style.color = '#4facfe';
                            }}
                          >
                            <Eye size={14} />
                            View
                          </button>
                          <button
                            onClick={() => openEditModal(lead)}
                            style={{ 
                              background: 'transparent', 
                              border: '1px solid #667eea', 
                              color: '#667eea',
                              cursor: 'pointer', 
                              padding: '6px 12px', 
                              borderRadius: '8px', 
                              transition: 'all 0.3s',
                              fontSize: '12px',
                              fontWeight: '600'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = '#667eea';
                              e.currentTarget.style.color = 'white';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = 'transparent';
                              e.currentTarget.style.color = '#667eea';
                            }}
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => deleteLead(lead.id)}
                            style={{ 
                              background: 'transparent', 
                              border: '1px solid #eb3349', 
                              color: '#eb3349',
                              cursor: 'pointer', 
                              padding: '6px 12px', 
                              borderRadius: '8px', 
                              transition: 'all 0.3s',
                              fontSize: '12px',
                              fontWeight: '600'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = '#eb3349';
                              e.currentTarget.style.color = 'white';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = 'transparent';
                              e.currentTarget.style.color = '#eb3349';
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      </div>

                      <div style={{ marginTop: '10px', marginBottom: '6px' }}>
                        <label style={{ fontSize: '11px', fontWeight: '600', color: '#666', marginBottom: '4px', display: 'block' }}>
                          Change Status:
                        </label>
                        <select
                          value={lead.status}
                          onChange={(e) => updateLeadStatus(lead.id, e.target.value)}
                          className="input-field"
                          style={{ padding: '8px 12px', fontSize: '13px' }}
                        >
                          <option value="new">New</option>
                          <option value="contacted">Contacted</option>
                          <option value="qualified">Qualified</option>
                          <option value="po_received">PO Received</option>
                          <option value="dead">Dead</option>
                        </select>
                      </div>

                      {lead.status === 'po_received' && (
                        <div style={{ marginTop: '12px' }}>
                          <button
                            onClick={() => convertLeadToDeal(lead)}
                            className="btn-success"
                            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
                          >
                            <ArrowRight size={14} />
                            Convert to Deal
                          </button>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </>
        )}


        {/* DEALS TAB */}
        {activeTab === 'deals' && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }} className="animate-slide-up">
              <div className="stat-card">
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', padding: '10px', borderRadius: '10px' }}>
                    <IndianRupee size={20} color="white" />
                  </div>
                  <div>
                    <div style={{ fontSize: '22px', fontWeight: '800', color: '#333' }}>
                      ₹{dealStats.activeValue.toLocaleString('en-IN')}
                    </div>
                    <div style={{ fontSize: '11px', color: '#666', fontWeight: '600' }}>Pipeline Value</div>
                  </div>
                </div>
              </div>

              <div className="stat-card">
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ background: 'linear-gradient(135deg, #ffa751 0%, #ffe259 100%)', padding: '10px', borderRadius: '10px' }}>
                    <Target size={20} color="white" />
                  </div>
                  <div>
                    <div style={{ fontSize: '22px', fontWeight: '800', color: '#333' }}>{dealStats.proposalSent}</div>
                    <div style={{ fontSize: '11px', color: '#666', fontWeight: '600' }}>Proposals Sent</div>
                  </div>
                </div>
              </div>

              <div className="stat-card">
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', padding: '10px', borderRadius: '10px' }}>
                    <TrendingUp size={20} color="white" />
                  </div>
                  <div>
                    <div style={{ fontSize: '22px', fontWeight: '800', color: '#333' }}>{dealStats.negotiation}</div>
                    <div style={{ fontSize: '11px', color: '#666', fontWeight: '600' }}>In Negotiation</div>
                  </div>
                </div>
              </div>

              <div className="stat-card">
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)', padding: '10px', borderRadius: '10px' }}>
                    <Award size={20} color="white" />
                  </div>
                  <div>
                    <div style={{ fontSize: '22px', fontWeight: '800', color: '#333' }}>{dealStats.won}</div>
                    <div style={{ fontSize: '11px', color: '#666', fontWeight: '600' }}>Won Deals</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="glass-card animate-scale-in" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <button onClick={() => setFilterDealStatus('proposal_sent')} className={`tab-button ${filterDealStatus === 'proposal_sent' ? 'active' : ''}`}>
                    Proposal Sent ({dealStats.proposalSent})
                  </button>
                  <button onClick={() => setFilterDealStatus('negotiation')} className={`tab-button ${filterDealStatus === 'negotiation' ? 'active' : ''}`}>
                    Negotiation ({dealStats.negotiation})
                  </button>
                  <button onClick={() => setFilterDealStatus('won')} className={`tab-button ${filterDealStatus === 'won' ? 'active' : ''}`}>
                    Won ({dealStats.won})
                  </button>
                  <button onClick={() => setFilterDealStatus('lost')} className={`tab-button ${filterDealStatus === 'lost' ? 'active' : ''}`}>
                    Lost ({dealStats.lost})
                  </button>
                </div>
                <button onClick={() => setShowAddDeal(true)} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Plus size={16} />Add Deal
                </button>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <input type="text" placeholder="Search deals..." value={dealSearchTerm} onChange={(e) => setDealSearchTerm(e.target.value)} className="input-field" />
              </div>

              <div>
                {filteredDeals.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '60px 20px', color: '#999' }}>
                    <Target size={48} style={{ margin: '0 auto 16px', opacity: 0.3 }} />
                    <p style={{ fontSize: '18px', fontWeight: '600' }}>No {filterDealStatus.replace('_', ' ')} deals found</p>
                  </div>
                ) : (
                  filteredDeals.map((deal) => (
                    <div key={deal.id} className="card-item animate-fade-in">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '10px' }}>
                        <div style={{ flex: 1 }}>
                          <h3 style={{ fontSize: '17px', fontWeight: '700', color: '#333', marginBottom: '6px' }}>{deal.title}</h3>
                          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '8px' }}>
                            <span className="badge badge-primary">{deal.owner}</span>
                            <span className="badge" style={{ background: '#f0f0f0', color: '#333' }}>
                              ₹{deal.value?.toLocaleString('en-IN')}
                            </span>
                            <span className={`badge ${
                              deal.status === 'won' ? 'badge-success' :
                              deal.status === 'lost' ? 'badge-danger' :
                              deal.status === 'negotiation' ? 'badge-info' :
                              'badge-warning'
                            }`} style={{ textTransform: 'uppercase' }}>
                              {deal.status.replace('_', ' ')}
                            </span>
                          </div>
                          <div style={{ fontSize: '13px', color: '#666', marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            {deal.clientName && (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <Building2 size={14} />
                                <span><strong>Client:</strong> {deal.clientName}</span>
                              </div>
                            )}
                            {deal.contactPerson && (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <User size={14} />
                                <span>{deal.contactPerson}</span>
                              </div>
                            )}
                            {deal.expectedCloseDate && (
                              <div style={{ fontSize: '12px', color: '#999' }}>
                                Expected close: {new Date(deal.expectedCloseDate).toLocaleDateString('en-IN')}
                              </div>
                            )}
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: '6px', marginLeft: '12px', flexWrap: 'wrap' }}>
                          <button
                            onClick={() => setViewingDeal(deal)}
                            style={{ background: 'transparent', border: '1px solid #4facfe', color: '#4facfe', cursor: 'pointer', padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}
                            onMouseEnter={(e) => { e.currentTarget.style.background = '#4facfe'; e.currentTarget.style.color = 'white'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#4facfe'; }}>
                            <Eye size={14} />
                            View
                          </button>
                          <button onClick={() => { setEditingDeal(deal); setEditDeal({ title: deal.title, clientName: deal.clientName || '', contactPerson: deal.contactPerson || '', phone: deal.phone || '', email: deal.email || '', owner: deal.owner, value: deal.value?.toString() || '', proposalDate: deal.proposalDate || '', expectedCloseDate: deal.expectedCloseDate || '', notes: deal.notes || '' }); }}
                            style={{ background: 'transparent', border: '1px solid #667eea', color: '#667eea', cursor: 'pointer', padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: '600' }}
                            onMouseEnter={(e) => { e.currentTarget.style.background = '#667eea'; e.currentTarget.style.color = 'white'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#667eea'; }}>
                            Edit
                          </button>
                          <button onClick={() => deleteDeal(deal.id)}
                            style={{ background: 'transparent', border: '1px solid #eb3349', color: '#eb3349', cursor: 'pointer', padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: '600' }}
                            onMouseEnter={(e) => { e.currentTarget.style.background = '#eb3349'; e.currentTarget.style.color = 'white'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#eb3349'; }}>
                            Delete
                          </button>
                        </div>
                      </div>

                      <div style={{ marginTop: '12px' }}>
                        <label style={{ fontSize: '11px', fontWeight: '600', color: '#666', marginBottom: '4px', display: 'block' }}>Change Status:</label>
                        <select value={deal.status} onChange={(e) => updateDealStatus(deal.id, e.target.value)} className="input-field" style={{ padding: '8px 12px', fontSize: '13px' }}>
                          <option value="proposal_sent">Proposal Sent</option>
                          <option value="negotiation">Negotiation</option>
                          <option value="won">Won</option>
                          <option value="lost">Lost</option>
                          <option value="on_hold">On Hold</option>
                        </select>
                      </div>

                      {['proposal_sent', 'negotiation'].includes(deal.status) && (
                        <div style={{ display: 'flex', gap: '6px', marginTop: '12px' }}>
                          <button onClick={() => updateDealStatus(deal.id, 'won')} className="btn-success"
                            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                            <CheckCircle size={14} />Win Deal
                          </button>
                          <button onClick={() => updateDealStatus(deal.id, 'lost')} className="btn-danger"
                            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                            <XCircle size={14} />Mark Lost
                          </button>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </>
        )}

        {/* PROJECTS TAB */}
        {activeTab === 'projects' && (
          <>
            {/* Project Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }} className="animate-slide-up">
              <div className="stat-card">
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ background: 'linear-gradient(135deg, #ffa751 0%, #ffe259 100%)', padding: '10px', borderRadius: '10px' }}>
                    <Briefcase size={20} color="white" />
                  </div>
                  <div>
                    <div style={{ fontSize: '22px', fontWeight: '800', color: '#333' }}>{projectStats.planning}</div>
                    <div style={{ fontSize: '11px', color: '#666', fontWeight: '600' }}>Planning</div>
                  </div>
                </div>
              </div>

              <div className="stat-card">
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', padding: '10px', borderRadius: '10px' }}>
                    <TrendingUp size={20} color="white" />
                  </div>
                  <div>
                    <div style={{ fontSize: '22px', fontWeight: '800', color: '#333' }}>{projectStats.inProgress}</div>
                    <div style={{ fontSize: '11px', color: '#666', fontWeight: '600' }}>In Progress</div>
                  </div>
                </div>
              </div>

              <div className="stat-card">
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)', padding: '10px', borderRadius: '10px' }}>
                    <CheckCircle size={20} color="white" />
                  </div>
                  <div>
                    <div style={{ fontSize: '22px', fontWeight: '800', color: '#333' }}>{projectStats.completed}</div>
                    <div style={{ fontSize: '11px', color: '#666', fontWeight: '600' }}>Completed</div>
                  </div>
                </div>
              </div>

              <div className="stat-card">
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ background: 'linear-gradient(135deg, #eb3349 0%, #f45c43 100%)', padding: '10px', borderRadius: '10px' }}>
                    <AlertCircle size={20} color="white" />
                  </div>
                  <div>
                    <div style={{ fontSize: '22px', fontWeight: '800', color: '#333' }}>{projects.length}</div>
                    <div style={{ fontSize: '11px', color: '#666', fontWeight: '600' }}>Total Projects</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content Card - Projects */}
            <div className="glass-card animate-scale-in" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#333' }}>Ongoing Projects</h2>
                <button onClick={() => setShowAddProject(true)} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Plus size={16} />
                  Add Project
                </button>
              </div>

              {/* Search */}
              <div style={{ marginBottom: '20px' }}>
                <input
                  type="text"
                  placeholder="Search projects..."
                  value={projectSearchTerm}
                  onChange={(e) => setProjectSearchTerm(e.target.value)}
                  className="input-field"
                />
              </div>

              {/* Projects List */}
              <div>
                {filteredProjects.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '60px 20px', color: '#999' }}>
                    <FolderKanban size={48} style={{ margin: '0 auto 16px', opacity: 0.3 }} />
                    <p style={{ fontSize: '18px', fontWeight: '600' }}>No projects found</p>
                    <p style={{ fontSize: '14px', marginTop: '8px' }}>
                      {projectSearchTerm ? 'Try adjusting your search' : 'Click "Add Project" to get started'}
                    </p>
                  </div>
                ) : (
                  filteredProjects.map((project) => (
                    <div key={project.id} className="lead-card animate-fade-in">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '10px' }}>
                        <div style={{ flex: 1 }}>
                          <h3 style={{ fontSize: '17px', fontWeight: '700', color: '#333', marginBottom: '6px' }}>
                            {project.title}
                          </h3>
                          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '6px' }}>
                            <span className="badge badge-primary">{project.owner}</span>
                            <span className={`badge ${
                              project.status === 'completed' ? 'badge-success' :
                              project.status === 'in_progress' ? 'badge-primary' :
                              project.status === 'on_hold' ? 'badge-danger' :
                              'badge-warning'
                            }`} style={{ textTransform: 'uppercase' }}>
                              {project.status.replace('_', ' ')}
                            </span>
                          </div>
                          {project.description && (
                            <p style={{ fontSize: '13px', color: '#666', marginTop: '6px' }}>{project.description}</p>
                          )}
                          <div style={{ fontSize: '11px', color: '#999', marginTop: '6px', display: 'flex', gap: '12px' }}>
                            {project.startDate && <span>Start: {new Date(project.startDate).toLocaleDateString('en-IN')}</span>}
                            {project.endDate && <span>End: {new Date(project.endDate).toLocaleDateString('en-IN')}</span>}
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: '6px', marginLeft: '12px' }}>
                          <button
                            onClick={() => openEditProjectModal(project)}
                            style={{ 
                              background: 'transparent', 
                              border: '1px solid #667eea', 
                              color: '#667eea',
                              cursor: 'pointer', 
                              padding: '6px 12px', 
                              borderRadius: '8px', 
                              transition: 'all 0.3s',
                              fontSize: '12px',
                              fontWeight: '600'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = '#667eea';
                              e.currentTarget.style.color = 'white';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = 'transparent';
                              e.currentTarget.style.color = '#667eea';
                            }}
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => deleteProject(project.id)}
                            style={{ 
                              background: 'transparent', 
                              border: '1px solid #eb3349', 
                              color: '#eb3349',
                              cursor: 'pointer', 
                              padding: '6px 12px', 
                              borderRadius: '8px', 
                              transition: 'all 0.3s',
                              fontSize: '12px',
                              fontWeight: '600'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = '#eb3349';
                              e.currentTarget.style.color = 'white';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = 'transparent';
                              e.currentTarget.style.color = '#eb3349';
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {/* View Lead Modal */}
      {viewingLead && (
        <div className="modal-overlay animate-fade-in" onClick={() => setViewingLead(null)}>
          <div className="modal-content animate-scale-in" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', borderBottom: '2px solid #f0f0f0', paddingBottom: '16px' }}>
              <div>
                <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#333', marginBottom: '4px' }}>{viewingLead.title}</h2>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <span className={`badge ${
                    viewingLead.status === 'po_received' ? 'badge-success' :
                    viewingLead.status === 'qualified' ? 'badge-info' :
                    viewingLead.status === 'contacted' ? 'badge-warning' :
                    viewingLead.status === 'dead' ? 'badge-danger' :
                    'badge-primary'
                  }`} style={{ textTransform: 'uppercase', fontSize: '11px' }}>
                    {viewingLead.status === 'po_received' ? 'PO RECEIVED' : viewingLead.status}
                  </span>
                  <span className="badge badge-primary">{viewingLead.owner}</span>
                </div>
              </div>
              <button onClick={() => setViewingLead(null)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '8px' }}>
                <X size={24} />
              </button>
            </div>

            <div style={{ display: 'grid', gap: '20px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <div style={{ fontSize: '11px', fontWeight: '600', color: '#666', marginBottom: '4px', textTransform: 'uppercase' }}>Contact Person</div>
                  <div style={{ fontSize: '15px', fontWeight: '600', color: '#333' }}>{viewingLead.contactName}</div>
                </div>
                <div>
                  <div style={{ fontSize: '11px', fontWeight: '600', color: '#666', marginBottom: '4px', textTransform: 'uppercase' }}>Company</div>
                  <div style={{ fontSize: '15px', fontWeight: '600', color: '#333' }}>{viewingLead.company || 'N/A'}</div>
                </div>
              </div>

              {(viewingLead.phone || viewingLead.email) && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  {viewingLead.phone && (
                    <div>
                      <div style={{ fontSize: '11px', fontWeight: '600', color: '#666', marginBottom: '4px', textTransform: 'uppercase' }}>Phone</div>
                      <div style={{ fontSize: '15px', color: '#333', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Phone size={14} color="#667eea" />
                        {viewingLead.phone}
                      </div>
                    </div>
                  )}
                  {viewingLead.email && (
                    <div>
                      <div style={{ fontSize: '11px', fontWeight: '600', color: '#666', marginBottom: '4px', textTransform: 'uppercase' }}>Email</div>
                      <div style={{ fontSize: '15px', color: '#333', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Mail size={14} color="#667eea" />
                        {viewingLead.email}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {viewingLead.notes && (
                <div>
                  <div style={{ fontSize: '11px', fontWeight: '600', color: '#666', marginBottom: '4px', textTransform: 'uppercase' }}>Notes</div>
                  <div style={{ fontSize: '14px', color: '#666', fontStyle: 'italic', background: '#f9f9f9', padding: '12px', borderRadius: '8px' }}>
                    "{viewingLead.notes}"
                  </div>
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', background: '#f9f9f9', padding: '16px', borderRadius: '8px' }}>
                <div>
                  <div style={{ fontSize: '11px', fontWeight: '600', color: '#666', marginBottom: '4px', textTransform: 'uppercase' }}>Created</div>
                  <div style={{ fontSize: '13px', color: '#333' }}>{new Date(viewingLead.createdAt).toLocaleString('en-IN')}</div>
                </div>
                {viewingLead.contactedDate && (
                  <div>
                    <div style={{ fontSize: '11px', fontWeight: '600', color: '#666', marginBottom: '4px', textTransform: 'uppercase' }}>Contacted</div>
                    <div style={{ fontSize: '13px', color: '#333' }}>{new Date(viewingLead.contactedDate).toLocaleString('en-IN')}</div>
                  </div>
                )}
                {viewingLead.qualifiedDate && (
                  <div>
                    <div style={{ fontSize: '11px', fontWeight: '600', color: '#666', marginBottom: '4px', textTransform: 'uppercase' }}>Qualified</div>
                    <div style={{ fontSize: '13px', color: '#333' }}>{new Date(viewingLead.qualifiedDate).toLocaleString('en-IN')}</div>
                  </div>
                )}
                {viewingLead.poReceivedDate && (
                  <div>
                    <div style={{ fontSize: '11px', fontWeight: '600', color: '#666', marginBottom: '4px', textTransform: 'uppercase' }}>PO Received</div>
                    <div style={{ fontSize: '13px', color: '#11998e', fontWeight: '600' }}>{new Date(viewingLead.poReceivedDate).toLocaleString('en-IN')}</div>
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                <button
                  onClick={() => {
                    setViewingLead(null);
                    openEditModal(viewingLead);
                  }}
                  className="btn-primary"
                  style={{ flex: 1, padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                >
                  <ArrowRight size={16} />
                  Edit Lead
                </button>
                <button
                  onClick={() => setViewingLead(null)}
                  style={{ flex: 1, padding: '12px', border: '2px solid #e0e0e0', borderRadius: '12px', background: 'white', fontWeight: '600', cursor: 'pointer' }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Lead Modal */}
      {showAddLead && (
        <div className="modal-overlay animate-fade-in" onClick={() => setShowAddLead(false)}>
          <div className="modal-content animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <img 
                  src="trio-techdesign-logo.png" 
                  alt="Medjay" 
                  style={{ width: '42px', height: '42px' }} 
                />
                <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#333' }}>Add New Lead</h2>
              </div>
              <button
                onClick={() => setShowAddLead(false)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '8px' }}
              >
                <X size={24} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#333', fontSize: '13px' }}>
                  Lead Title *
                </label>
                <input
                  type="text"
                  value={newLead.title}
                  onChange={(e) => setNewLead({ ...newLead, title: e.target.value })}
                  className="input-field"
                  placeholder="Enter lead title"
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#333', fontSize: '13px' }}>
                  Contact Name *
                </label>
                <input
                  type="text"
                  value={newLead.contactName}
                  onChange={(e) => setNewLead({ ...newLead, contactName: e.target.value })}
                  className="input-field"
                  placeholder="Enter contact person name"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#333', fontSize: '13px' }}>
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={newLead.phone}
                    onChange={(e) => setNewLead({ ...newLead, phone: e.target.value })}
                    className="input-field"
                    placeholder="+91-9999999999"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#333', fontSize: '13px' }}>
                    Email
                  </label>
                  <input
                    type="email"
                    value={newLead.email}
                    onChange={(e) => setNewLead({ ...newLead, email: e.target.value })}
                    className="input-field"
                    placeholder="email@company.com"
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#333', fontSize: '13px' }}>
                  Company
                </label>
                <input
                  type="text"
                  value={newLead.company}
                  onChange={(e) => setNewLead({ ...newLead, company: e.target.value })}
                  className="input-field"
                  placeholder="Company name"
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#333', fontSize: '13px' }}>
                  Lead Owner *
                </label>
                <select
                  value={newLead.owner}
                  onChange={(e) => setNewLead({ ...newLead, owner: e.target.value })}
                  className="input-field"
                >
                  <option value="">Select owner</option>
                  {owners.map(owner => (
                    <option key={owner} value={owner}>{owner}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#333', fontSize: '13px' }}>
                  Estimated Value (₹) *
                </label>
                <input
                  type="number"
                  value={newLead.value}
                  onChange={(e) => setNewLead({ ...newLead, value: e.target.value })}
                  className="input-field"
                  placeholder="0"
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#333', fontSize: '13px' }}>
                  Notes (Optional)
                </label>
                <textarea
                  value={newLead.notes}
                  onChange={(e) => setNewLead({ ...newLead, notes: e.target.value })}
                  className="input-field"
                  rows="3"
                  placeholder="Add any additional notes..."
                />
              </div>

              <button
                onClick={() => setShowAddOwner(true)}
                style={{
                  padding: '10px',
                  border: '2px dashed #667eea',
                  borderRadius: '12px',
                  background: 'transparent',
                  color: '#667eea',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  fontSize: '13px'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(102, 126, 234, 0.1)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                + Add New Owner
              </button>

              <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                <button
                  onClick={() => setShowAddLead(false)}
                  style={{
                    flex: 1,
                    padding: '12px',
                    border: '2px solid #e0e0e0',
                    borderRadius: '12px',
                    background: 'white',
                    fontWeight: '600',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  Cancel
                </button>
                <button onClick={addLead} className="btn-primary" style={{ flex: 1, padding: '12px' }}>
                  Add Lead
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Owner Modal */}
      {showAddOwner && (
        <div className="modal-overlay animate-fade-in" onClick={() => setShowAddOwner(false)}>
          <div className="modal-content animate-scale-in" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '400px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <img 
                  src="trio-techdesign-logo.png" 
                  alt="Medjay" 
                  style={{ width: '38px', height: '38px' }} 
                />
                <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#333' }}>Add Owner</h2>
              </div>
              <button
                onClick={() => setShowAddOwner(false)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '8px' }}
              >
                <X size={24} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#333', fontSize: '13px' }}>
                  Owner Name
                </label>
                <input
                  type="text"
                  value={newOwnerName}
                  onChange={(e) => setNewOwnerName(e.target.value)}
                  className="input-field"
                  placeholder="Enter name"
                />
              </div>

              <div>
                <div style={{ fontSize: '12px', fontWeight: '600', color: '#666', marginBottom: '8px' }}>
                  CURRENT OWNERS:
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {owners.map(owner => (
                    <div key={owner} style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '600', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
                      <span>{owner}</span>
                      <button
                        onClick={() => deleteOwner(owner)}
                        style={{ background: 'rgba(255,255,255,0.3)', border: 'none', borderRadius: '50%', width: '16px', height: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', padding: '0', marginLeft: '4px' }}
                        title="Delete owner"
                      >
                        <X size={10} color="white" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={() => setShowAddOwner(false)}
                  style={{
                    flex: 1,
                    padding: '12px',
                    border: '2px solid #e0e0e0',
                    borderRadius: '12px',
                    background: 'white',
                    fontWeight: '600',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  Cancel
                </button>
                <button onClick={addOwner} className="btn-primary" style={{ flex: 1, padding: '12px' }}>
                  Add Owner
                </button>
              </div>
            </div>
          </div>
        </div>
      )}


      {/* View Deal Modal */}
      {viewingDeal && (
        <div className="modal-overlay animate-fade-in" onClick={() => setViewingDeal(null)}>
          <div className="modal-content animate-scale-in" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '700px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', borderBottom: '2px solid #f0f0f0', paddingBottom: '16px' }}>
              <div style={{ flex: 1 }}>
                <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#333', marginBottom: '8px' }}>{viewingDeal.title}</h2>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <span className="badge badge-primary">{viewingDeal.owner}</span>
                  <span className="badge" style={{ background: '#f0f0f0', color: '#333' }}>
                    ₹{viewingDeal.value?.toLocaleString('en-IN')}
                  </span>
                  <span className={`badge ${
                    viewingDeal.status === 'won' ? 'badge-success' :
                    viewingDeal.status === 'lost' ? 'badge-danger' :
                    viewingDeal.status === 'negotiation' ? 'badge-info' :
                    'badge-warning'
                  }`} style={{ textTransform: 'uppercase' }}>
                    {viewingDeal.status.replace('_', ' ')}
                  </span>
                </div>
              </div>
              <button onClick={() => setViewingDeal(null)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '8px' }}>
                <X size={24} />
              </button>
            </div>

            <div style={{ display: 'grid', gap: '20px' }}>
              {viewingDeal.clientName && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <div style={{ fontSize: '11px', fontWeight: '600', color: '#666', marginBottom: '4px', textTransform: 'uppercase' }}>Client</div>
                    <div style={{ fontSize: '15px', fontWeight: '600', color: '#333', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Building2 size={14} color="#667eea" />
                      {viewingDeal.clientName}
                    </div>
                  </div>
                  {viewingDeal.contactPerson && (
                    <div>
                      <div style={{ fontSize: '11px', fontWeight: '600', color: '#666', marginBottom: '4px', textTransform: 'uppercase' }}>Contact Person</div>
                      <div style={{ fontSize: '15px', fontWeight: '600', color: '#333', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <User size={14} color="#667eea" />
                        {viewingDeal.contactPerson}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {(viewingDeal.phone || viewingDeal.email) && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  {viewingDeal.phone && (
                    <div>
                      <div style={{ fontSize: '11px', fontWeight: '600', color: '#666', marginBottom: '4px', textTransform: 'uppercase' }}>Phone</div>
                      <div style={{ fontSize: '15px', color: '#333', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Phone size={14} color="#667eea" />
                        {viewingDeal.phone}
                      </div>
                    </div>
                  )}
                  {viewingDeal.email && (
                    <div>
                      <div style={{ fontSize: '11px', fontWeight: '600', color: '#666', marginBottom: '4px', textTransform: 'uppercase' }}>Email</div>
                      <div style={{ fontSize: '15px', color: '#333', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Mail size={14} color="#667eea" />
                        {viewingDeal.email}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {(viewingDeal.proposalDate || viewingDeal.expectedCloseDate) && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', background: '#f9f9f9', padding: '16px', borderRadius: '8px' }}>
                  {viewingDeal.proposalDate && (
                    <div>
                      <div style={{ fontSize: '11px', fontWeight: '600', color: '#666', marginBottom: '4px', textTransform: 'uppercase' }}>Proposal Date</div>
                      <div style={{ fontSize: '13px', color: '#333' }}>{new Date(viewingDeal.proposalDate).toLocaleDateString('en-IN')}</div>
                    </div>
                  )}
                  {viewingDeal.expectedCloseDate && (
                    <div>
                      <div style={{ fontSize: '11px', fontWeight: '600', color: '#666', marginBottom: '4px', textTransform: 'uppercase' }}>Expected Close</div>
                      <div style={{ fontSize: '13px', color: '#333' }}>{new Date(viewingDeal.expectedCloseDate).toLocaleDateString('en-IN')}</div>
                    </div>
                  )}
                </div>
              )}

              {viewingDeal.notes && (
                <div>
                  <div style={{ fontSize: '11px', fontWeight: '600', color: '#666', marginBottom: '4px', textTransform: 'uppercase' }}>Notes</div>
                  <div style={{ fontSize: '14px', color: '#666', fontStyle: 'italic', background: '#f9f9f9', padding: '12px', borderRadius: '8px' }}>
                    "{viewingDeal.notes}"
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                <button
                  onClick={() => {
                    setViewingDeal(null);
                    setEditingDeal(viewingDeal);
                    setEditDeal({ 
                      title: viewingDeal.title, 
                      clientName: viewingDeal.clientName || '', 
                      contactPerson: viewingDeal.contactPerson || '', 
                      phone: viewingDeal.phone || '', 
                      email: viewingDeal.email || '', 
                      owner: viewingDeal.owner, 
                      value: viewingDeal.value?.toString() || '', 
                      proposalDate: viewingDeal.proposalDate || '', 
                      expectedCloseDate: viewingDeal.expectedCloseDate || '', 
                      notes: viewingDeal.notes || '' 
                    });
                  }}
                  className="btn-primary"
                  style={{ flex: 1, padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                >
                  <ArrowRight size={16} />
                  Edit Deal
                </button>
                <button
                  onClick={() => setViewingDeal(null)}
                  style={{ flex: 1, padding: '12px', border: '2px solid #e0e0e0', borderRadius: '12px', background: 'white', fontWeight: '600', cursor: 'pointer' }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Deal Modal */}
      {showAddDeal && (
        <div className="modal-overlay animate-fade-in" onClick={() => setShowAddDeal(false)}>
          <div className="modal-content animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <img src="trio-techdesign-logo.png" alt="Medjay" style={{ width: '42px', height: '42px' }} />
                <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#333' }}>Add New Deal</h2>
              </div>
              <button onClick={() => setShowAddDeal(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '8px' }}>
                <X size={24} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#333', fontSize: '13px' }}>Deal Title *</label>
                <input type="text" value={newDeal.title} onChange={(e) => setNewDeal({ ...newDeal, title: e.target.value })} className="input-field" placeholder="Enter deal title" />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#333', fontSize: '13px' }}>Client Name</label>
                <input type="text" value={newDeal.clientName} onChange={(e) => setNewDeal({ ...newDeal, clientName: e.target.value })} className="input-field" placeholder="Company name" />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#333', fontSize: '13px' }}>Contact Person</label>
                <input type="text" value={newDeal.contactPerson} onChange={(e) => setNewDeal({ ...newDeal, contactPerson: e.target.value })} className="input-field" placeholder="Contact person name" />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#333', fontSize: '13px' }}>Phone</label>
                  <input type="tel" value={newDeal.phone} onChange={(e) => setNewDeal({ ...newDeal, phone: e.target.value })} className="input-field" placeholder="+91-9999999999" />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#333', fontSize: '13px' }}>Email</label>
                  <input type="email" value={newDeal.email} onChange={(e) => setNewDeal({ ...newDeal, email: e.target.value })} className="input-field" placeholder="email@company.com" />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#333', fontSize: '13px' }}>Deal Owner *</label>
                <select value={newDeal.owner} onChange={(e) => setNewDeal({ ...newDeal, owner: e.target.value })} className="input-field">
                  <option value="">Select owner</option>
                  {owners.map(owner => (<option key={owner} value={owner}>{owner}</option>))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#333', fontSize: '13px' }}>Deal Value (₹) *</label>
                <input type="number" value={newDeal.value} onChange={(e) => setNewDeal({ ...newDeal, value: e.target.value })} className="input-field" placeholder="0" />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#333', fontSize: '13px' }}>Proposal Date</label>
                  <input type="date" value={newDeal.proposalDate} onChange={(e) => setNewDeal({ ...newDeal, proposalDate: e.target.value })} className="input-field" />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#333', fontSize: '13px' }}>Expected Close Date</label>
                  <input type="date" value={newDeal.expectedCloseDate} onChange={(e) => setNewDeal({ ...newDeal, expectedCloseDate: e.target.value })} className="input-field" />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#333', fontSize: '13px' }}>Notes</label>
                <textarea value={newDeal.notes} onChange={(e) => setNewDeal({ ...newDeal, notes: e.target.value })} className="input-field" rows="3" placeholder="Add notes..." />
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                <button onClick={() => setShowAddDeal(false)} style={{ flex: 1, padding: '12px', border: '2px solid #e0e0e0', borderRadius: '12px', background: 'white', fontWeight: '600', cursor: 'pointer', fontSize: '14px' }}>Cancel</button>
                <button onClick={addDeal} className="btn-primary" style={{ flex: 1, padding: '12px' }}>Add Deal</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Deal Modal */}
      {editingDeal && (
        <div className="modal-overlay animate-fade-in" onClick={() => { setEditingDeal(null); setEditDeal({ title: '', clientName: '', contactPerson: '', phone: '', email: '', owner: '', value: '', proposalDate: '', expectedCloseDate: '', notes: '' }); }}>
          <div className="modal-content animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <img src="trio-techdesign-logo.png" alt="Medjay" style={{ width: '42px', height: '42px' }} />
                <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#333' }}>Edit Deal</h2>
              </div>
              <button onClick={() => { setEditingDeal(null); setEditDeal({ title: '', clientName: '', contactPerson: '', phone: '', email: '', owner: '', value: '', proposalDate: '', expectedCloseDate: '', notes: '' }); }} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '8px' }}>
                <X size={24} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#333', fontSize: '13px' }}>Deal Title *</label>
                <input type="text" value={editDeal.title} onChange={(e) => setEditDeal({ ...editDeal, title: e.target.value })} className="input-field" placeholder="Enter deal title" />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#333', fontSize: '13px' }}>Client Name</label>
                <input type="text" value={editDeal.clientName} onChange={(e) => setEditDeal({ ...editDeal, clientName: e.target.value })} className="input-field" placeholder="Company name" />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#333', fontSize: '13px' }}>Contact Person</label>
                <input type="text" value={editDeal.contactPerson} onChange={(e) => setEditDeal({ ...editDeal, contactPerson: e.target.value })} className="input-field" placeholder="Contact person name" />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#333', fontSize: '13px' }}>Phone</label>
                  <input type="tel" value={editDeal.phone} onChange={(e) => setEditDeal({ ...editDeal, phone: e.target.value })} className="input-field" placeholder="+91-9999999999" />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#333', fontSize: '13px' }}>Email</label>
                  <input type="email" value={editDeal.email} onChange={(e) => setEditDeal({ ...editDeal, email: e.target.value })} className="input-field" placeholder="email@company.com" />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#333', fontSize: '13px' }}>Deal Owner *</label>
                <select value={editDeal.owner} onChange={(e) => setEditDeal({ ...editDeal, owner: e.target.value })} className="input-field">
                  <option value="">Select owner</option>
                  {owners.map(owner => (<option key={owner} value={owner}>{owner}</option>))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#333', fontSize: '13px' }}>Deal Value (₹) *</label>
                <input type="number" value={editDeal.value} onChange={(e) => setEditDeal({ ...editDeal, value: e.target.value })} className="input-field" placeholder="0" />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#333', fontSize: '13px' }}>Proposal Date</label>
                  <input type="date" value={editDeal.proposalDate} onChange={(e) => setEditDeal({ ...editDeal, proposalDate: e.target.value })} className="input-field" />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#333', fontSize: '13px' }}>Expected Close Date</label>
                  <input type="date" value={editDeal.expectedCloseDate} onChange={(e) => setEditDeal({ ...editDeal, expectedCloseDate: e.target.value })} className="input-field" />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#333', fontSize: '13px' }}>Notes</label>
                <textarea value={editDeal.notes} onChange={(e) => setEditDeal({ ...editDeal, notes: e.target.value })} className="input-field" rows="3" placeholder="Add notes..." />
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                <button onClick={() => { setEditingDeal(null); setEditDeal({ title: '', clientName: '', contactPerson: '', phone: '', email: '', owner: '', value: '', proposalDate: '', expectedCloseDate: '', notes: '' }); }} style={{ flex: 1, padding: '12px', border: '2px solid #e0e0e0', borderRadius: '12px', background: 'white', fontWeight: '600', cursor: 'pointer', fontSize: '14px' }}>Cancel</button>
                <button onClick={updateDeal} className="btn-primary" style={{ flex: 1, padding: '12px' }}>Update Deal</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Lead Modal */}
      {editingLead && (
        <div className="modal-overlay animate-fade-in" onClick={() => { setEditingLead(null); setEditLead({ title: '', contactName: '', phone: '', email: '', company: '', owner: '', value: '', notes: '' }); }}>
          <div className="modal-content animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <img 
                  src="trio-techdesign-logo.png" 
                  alt="Medjay" 
                  style={{ width: '42px', height: '42px' }} 
                />
                <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#333' }}>Edit Lead</h2>
              </div>
              <button
                onClick={() => { setEditingLead(null); setEditLead({ title: '', contactName: '', phone: '', email: '', company: '', owner: '', value: '', notes: '' }); }}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '8px' }}
              >
                <X size={24} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#333', fontSize: '13px' }}>
                  Lead Title *
                </label>
                <input
                  type="text"
                  value={editLead.title}
                  onChange={(e) => setEditLead({ ...editLead, title: e.target.value })}
                  className="input-field"
                  placeholder="Enter lead title"
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#333', fontSize: '13px' }}>
                  Contact Name *
                </label>
                <input
                  type="text"
                  value={editLead.contactName}
                  onChange={(e) => setEditLead({ ...editLead, contactName: e.target.value })}
                  className="input-field"
                  placeholder="Enter contact person name"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#333', fontSize: '13px' }}>
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={editLead.phone}
                    onChange={(e) => setEditLead({ ...editLead, phone: e.target.value })}
                    className="input-field"
                    placeholder="+91-9999999999"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#333', fontSize: '13px' }}>
                    Email
                  </label>
                  <input
                    type="email"
                    value={editLead.email}
                    onChange={(e) => setEditLead({ ...editLead, email: e.target.value })}
                    className="input-field"
                    placeholder="email@company.com"
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#333', fontSize: '13px' }}>
                  Company
                </label>
                <input
                  type="text"
                  value={editLead.company}
                  onChange={(e) => setEditLead({ ...editLead, company: e.target.value })}
                  className="input-field"
                  placeholder="Company name"
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#333', fontSize: '13px' }}>
                  Lead Owner *
                </label>
                <select
                  value={editLead.owner}
                  onChange={(e) => setEditLead({ ...editLead, owner: e.target.value })}
                  className="input-field"
                >
                  <option value="">Select owner</option>
                  {owners.map(owner => (
                    <option key={owner} value={owner}>{owner}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#333', fontSize: '13px' }}>
                  Estimated Value (₹) *
                </label>
                <input
                  type="number"
                  value={editLead.value}
                  onChange={(e) => setEditLead({ ...editLead, value: e.target.value })}
                  className="input-field"
                  placeholder="0"
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#333', fontSize: '13px' }}>
                  Notes (Optional)
                </label>
                <textarea
                  value={editLead.notes}
                  onChange={(e) => setEditLead({ ...editLead, notes: e.target.value })}
                  className="input-field"
                  rows="3"
                  placeholder="Add any additional notes..."
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                <button
                  onClick={() => { setEditingLead(null); setEditLead({ title: '', contactName: '', phone: '', email: '', company: '', owner: '', value: '', notes: '' }); }}
                  style={{
                    flex: 1,
                    padding: '12px',
                    border: '2px solid #e0e0e0',
                    borderRadius: '12px',
                    background: 'white',
                    fontWeight: '600',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  Cancel
                </button>
                <button onClick={updateLead} className="btn-primary" style={{ flex: 1, padding: '12px' }}>
                  Update Lead
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Project Modal */}
      {showAddProject && (
        <div className="modal-overlay animate-fade-in" onClick={() => setShowAddProject(false)}>
          <div className="modal-content animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <img 
                  src="trio-techdesign-logo.png" 
                  alt="Medjay" 
                  style={{ width: '42px', height: '42px' }} 
                />
                <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#333' }}>Add New Project</h2>
              </div>
              <button
                onClick={() => setShowAddProject(false)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '8px' }}
              >
                <X size={24} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#333', fontSize: '13px' }}>
                  Project Title *
                </label>
                <input
                  type="text"
                  value={newProject.title}
                  onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                  className="input-field"
                  placeholder="Enter project title"
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#333', fontSize: '13px' }}>
                  Description
                </label>
                <textarea
                  value={newProject.description}
                  onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                  className="input-field"
                  rows="3"
                  placeholder="Project description..."
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#333', fontSize: '13px' }}>
                  Project Owner *
                </label>
                <select
                  value={newProject.owner}
                  onChange={(e) => setNewProject({ ...newProject, owner: e.target.value })}
                  className="input-field"
                >
                  <option value="">Select owner</option>
                  {owners.map(owner => (
                    <option key={owner} value={owner}>{owner}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#333', fontSize: '13px' }}>
                  Status
                </label>
                <select
                  value={newProject.status}
                  onChange={(e) => setNewProject({ ...newProject, status: e.target.value })}
                  className="input-field"
                >
                  <option value="planning">Planning</option>
                  <option value="in_progress">In Progress</option>
                  <option value="on_hold">On Hold</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#333', fontSize: '13px' }}>
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={newProject.startDate}
                    onChange={(e) => setNewProject({ ...newProject, startDate: e.target.value })}
                    className="input-field"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#333', fontSize: '13px' }}>
                    End Date
                  </label>
                  <input
                    type="date"
                    value={newProject.endDate}
                    onChange={(e) => setNewProject({ ...newProject, endDate: e.target.value })}
                    className="input-field"
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                <button
                  onClick={() => setShowAddProject(false)}
                  style={{
                    flex: 1,
                    padding: '12px',
                    border: '2px solid #e0e0e0',
                    borderRadius: '12px',
                    background: 'white',
                    fontWeight: '600',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  Cancel
                </button>
                <button onClick={addProject} className="btn-primary" style={{ flex: 1, padding: '12px' }}>
                  Add Project
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Project Modal */}
      {editingProject && (
        <div className="modal-overlay animate-fade-in" onClick={() => { setEditingProject(null); setEditProject({ title: '', description: '', status: 'planning', owner: '', startDate: '', endDate: '' }); }}>
          <div className="modal-content animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <img 
                  src="trio-techdesign-logo.png" 
                  alt="Medjay" 
                  style={{ width: '42px', height: '42px' }} 
                />
                <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#333' }}>Edit Project</h2>
              </div>
              <button
                onClick={() => { setEditingProject(null); setEditProject({ title: '', description: '', status: 'planning', owner: '', startDate: '', endDate: '' }); }}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '8px' }}
              >
                <X size={24} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#333', fontSize: '13px' }}>
                  Project Title *
                </label>
                <input
                  type="text"
                  value={editProject.title}
                  onChange={(e) => setEditProject({ ...editProject, title: e.target.value })}
                  className="input-field"
                  placeholder="Enter project title"
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#333', fontSize: '13px' }}>
                  Description
                </label>
                <textarea
                  value={editProject.description}
                  onChange={(e) => setEditProject({ ...editProject, description: e.target.value })}
                  className="input-field"
                  rows="3"
                  placeholder="Project description..."
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#333', fontSize: '13px' }}>
                  Project Owner *
                </label>
                <select
                  value={editProject.owner}
                  onChange={(e) => setEditProject({ ...editProject, owner: e.target.value })}
                  className="input-field"
                >
                  <option value="">Select owner</option>
                  {owners.map(owner => (
                    <option key={owner} value={owner}>{owner}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#333', fontSize: '13px' }}>
                  Status
                </label>
                <select
                  value={editProject.status}
                  onChange={(e) => setEditProject({ ...editProject, status: e.target.value })}
                  className="input-field"
                >
                  <option value="planning">Planning</option>
                  <option value="in_progress">In Progress</option>
                  <option value="on_hold">On Hold</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#333', fontSize: '13px' }}>
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={editProject.startDate}
                    onChange={(e) => setEditProject({ ...editProject, startDate: e.target.value })}
                    className="input-field"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#333', fontSize: '13px' }}>
                    End Date
                  </label>
                  <input
                    type="date"
                    value={editProject.endDate}
                    onChange={(e) => setEditProject({ ...editProject, endDate: e.target.value })}
                    className="input-field"
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                <button
                  onClick={() => { setEditingProject(null); setEditProject({ title: '', description: '', status: 'planning', owner: '', startDate: '', endDate: '' }); }}
                  style={{
                    flex: 1,
                    padding: '12px',
                    border: '2px solid #e0e0e0',
                    borderRadius: '12px',
                    background: 'white',
                    fontWeight: '600',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  Cancel
                </button>
                <button onClick={updateProject} className="btn-primary" style={{ flex: 1, padding: '12px' }}>
                  Update Project
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrioTechdesignPipeline;
