import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Button,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Badge,
} from '@mui/material';
import hrService from "../../services/hrService";
import {
  KeyboardArrowDown as KeyboardArrowDownIcon,
  Badge as BadgeIcon,
  History as HistoryIcon,
  NoteAdd as NoteAddIcon,
  SupervisorAccount as SupervisorAccountIcon,
  PersonAdd as PersonAddIcon,
  VpnKey as VpnKeyIcon,
  Group as GroupIcon,
} from '@mui/icons-material';

export default function HrTopbarSection({ user }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const [pendingCount, setPendingCount] = useState(0);
  const navigate = useNavigate();

  const canApprove = ["rm_head", "business_head", "top_management"].includes(user?.role);
  const canAdd = canApprove;
  const canApply = ["rm", "rm_head", "business_head"].includes(user?.role);
  useEffect(() => {
    const fetchPending = async () => {
      if (!canApprove) return;
      try {
        const pendingLeaves = await hrService.getPendingLeaveRequests();
        setPendingCount(pendingLeaves.length);
      } catch (error) {
        console.error('Error fetching pending leaves:', error);
        setPendingCount(0);
      }
    };
    fetchPending();
  }, [canApprove]);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleNavigation = (path) => {
    navigate(path);
    handleMenuClose();
  };

  return (
    <>
      <Button
        color="inherit"
        endIcon={<KeyboardArrowDownIcon />}
        onClick={handleMenuOpen}
        startIcon={
          pendingCount > 0 ? (
            <Badge badgeContent={pendingCount} color="error">
              <BadgeIcon />
            </Badge>
          ) : (
            <BadgeIcon />
          )
        }
      >
        HR
      </Button>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        {canApprove && (
          <MenuItem onClick={() => handleNavigation('/dashboard/all-leaves')}>
            <ListItemIcon>
              <NoteAddIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText primary="All Leaves" />
          </MenuItem>
        )}
        
        <MenuItem onClick={() => handleNavigation('/dashboard/leave-history')}>
          <ListItemIcon>
            <HistoryIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="My Leave History" />
        </MenuItem>

        {canApply && (
          <MenuItem onClick={() => handleNavigation('/dashboard/apply-leave')}>
            <ListItemIcon>
              <NoteAddIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText primary="Apply Leave" />
          </MenuItem>
        )}

        {canApprove && (
          <MenuItem 
            onClick={() => handleNavigation('/dashboard/approvals')}
          >
            <ListItemIcon>
              <SupervisorAccountIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText 
              primary="Manager Approvals" 
              secondary={pendingCount > 0 ? `${pendingCount} pending` : null}
            />
          </MenuItem>
        )}

        <MenuItem onClick={() => handleNavigation('/dashboard/employees')}>
          <ListItemIcon>
            <GroupIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Employee Directory" />
        </MenuItem>

        {canAdd && (
          <MenuItem onClick={() => handleNavigation('/dashboard/add-subordinate')}>
            <ListItemIcon>
              <PersonAddIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText primary="Add Subordinate" />
          </MenuItem>
        )}

        <MenuItem onClick={() => handleNavigation('/dashboard/change-password')}>
          <ListItemIcon>
            <VpnKeyIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Change Password" />
        </MenuItem>
      </Menu>
    </>
  );
}
