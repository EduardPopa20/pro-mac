import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  IconButton,
  Popper,
  Paper,
  Box,
  Typography,
  Button,
  Divider,
  Fade,
  ClickAwayListener,
  useTheme
} from '@mui/material'
import {
  AccountCircle,
  Login,
  PersonAdd,
  Person,
  Email,
  Phone,
  Home
} from '@mui/icons-material'
import { useAuthStore } from '../../stores/auth'

const UserProfilePopper: React.FC = () => {
  const theme = useTheme()
  const navigate = useNavigate()
  const { user, signOut } = useAuthStore()
  
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const open = Boolean(anchorEl)

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(anchorEl ? null : event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const handleNavigation = (path: string) => {
    navigate(path)
    handleClose()
  }

  const handleSignOut = async () => {
    try {
      await signOut()
      navigate('/conectare')
      handleClose()
    } catch (error) {
      // Sign out error - handled gracefully
    }
  }

  return (
    <>
      <IconButton
        size="medium"
        onClick={handleClick}
        sx={{
          minWidth: { xs: 44, md: 40 },
          minHeight: { xs: 44, md: 40 },
          color: 'white',
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.1)'
          }
        }}
      >
        <AccountCircle />
      </IconButton>

      <Popper 
        open={open} 
        anchorEl={anchorEl} 
        placement="bottom-end" 
        transition
        strategy="fixed" // Prevents lag on mobile scroll
        sx={{
          zIndex: theme.zIndex.modal + 1 // Higher than breadcrumbs and other content
        }}
      >
        {({ TransitionProps }) => (
          <Fade {...TransitionProps} timeout={350}>
            <Paper
              sx={{
                width: { 
                  xs: '100vw', // Full screen width on mobile
                  md: 280 
                },
                maxWidth: { xs: '100vw', md: 280 },
                mt: 0.5,
                mx: { xs: 0, md: 0 }, // No margins on mobile for full width
                borderRadius: { xs: 0, md: 2 }, // No border radius on mobile for full edge-to-edge
                boxShadow: theme.shadows[8],
                border: '1px solid',
                borderColor: 'divider',
                // Remove side borders on mobile for true full width
                borderLeft: { xs: 'none', md: '1px solid' },
                borderRight: { xs: 'none', md: '1px solid' },
                // Add small arrow/connector effect on mobile - positioned for full width
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: -8,
                  right: { xs: 32, md: 16 }, // Adjust position for full width
                  width: 0,
                  height: 0,
                  borderLeft: '8px solid transparent',
                  borderRight: '8px solid transparent',
                  borderBottom: '8px solid',
                  borderBottomColor: 'divider',
                  display: { xs: 'block', md: 'none' }
                },
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  top: -7,
                  right: { xs: 32, md: 16 }, // Adjust position for full width
                  width: 0,
                  height: 0,
                  borderLeft: '8px solid transparent',
                  borderRight: '8px solid transparent',
                  borderBottom: '8px solid',
                  borderBottomColor: 'background.paper',
                  display: { xs: 'block', md: 'none' }
                }
              }}
            >
              <ClickAwayListener onClickAway={handleClose}>
                <Box>
                  {user ? (
                    /* Authenticated User Menu */
                    <>
                      <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
                        <Box display="flex" alignItems="center" gap={2}>
                          <AccountCircle sx={{ fontSize: 40, color: 'primary.main' }} />
                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography variant="subtitle1" noWrap sx={{ fontWeight: 600 }}>
                              {user.full_name || 'Utilizator'}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" noWrap>
                              {user.email}
                            </Typography>
                          </Box>
                        </Box>
                      </Box>

                      <Box sx={{ py: 1 }}>
                        <Button
                          fullWidth
                          variant="text"
                          startIcon={<Person />}
                          onClick={() => handleNavigation('/profil')}
                          sx={{
                            justifyContent: 'flex-start',
                            px: 2,
                            py: 1.5,
                            minHeight: { xs: 44, md: 40 },
                            borderRadius: 0,
                            '&:hover': { backgroundColor: 'action.hover' }
                          }}
                        >
                          Profilul meu
                        </Button>


                        <Divider sx={{ my: 1 }} />

                        <Button
                          fullWidth
                          variant="text"
                          onClick={handleSignOut}
                          sx={{
                            justifyContent: 'flex-start',
                            px: 2,
                            py: 1.5,
                            minHeight: { xs: 44, md: 40 },
                            borderRadius: 0,
                            color: 'error.main',
                            '&:hover': { 
                              backgroundColor: 'error.light',
                              color: 'error.dark'
                            }
                          }}
                        >
                          Deconectează-te
                        </Button>
                      </Box>
                    </>
                  ) : (
                    /* Unauthenticated User Menu */
                    <>
                      <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          Contul meu
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Autentifică-te pentru a accesa contul tău
                        </Typography>
                      </Box>

                      <Box sx={{ p: 2 }}>
                        <Button
                          fullWidth
                          variant="contained"
                          size="large"
                          startIcon={<Login />}
                          onClick={() => handleNavigation('/conectare')}
                          sx={{
                            mb: 2,
                            minHeight: { xs: 48, md: 48 }
                          }}
                        >
                          Autentifică-te
                        </Button>

                        <Button
                          fullWidth
                          variant="outlined"
                          size="large"
                          startIcon={<PersonAdd />}
                          onClick={() => handleNavigation('/creeaza-cont')}
                          sx={{
                            minHeight: { xs: 48, md: 48 }
                          }}
                        >
                          Creează cont nou
                        </Button>
                      </Box>

                      <Divider />

                      <Box sx={{ p: 2 }}>
                        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
                          Cu un cont poți salva produsele favorite, urmări comenzile și multe altele.
                        </Typography>
                      </Box>
                    </>
                  )}
                </Box>
              </ClickAwayListener>
            </Paper>
          </Fade>
        )}
      </Popper>
    </>
  )
}

export default UserProfilePopper