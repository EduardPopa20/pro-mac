import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import "slick-carousel/slick/slick.css"
import "slick-carousel/slick/slick-theme.css"
import {
  Box,
  Typography,
  Button,
  Breadcrumbs,
  Link,
  Paper,
  CircularProgress,
  Tooltip,
  Container,
  useTheme,
  useMediaQuery,
  IconButton,
  Stack
} from '@mui/material'
import {
  Add,
  Store,
  LocationOn,
  AccessTime,
  Phone,
  Business as BusinessIcon
} from '@mui/icons-material'
import { useSettingsStore } from '../../stores/settings'
import { useConfirmation } from '../../components/common/ConfirmationDialog'
import { showSuccessAlert, showErrorAlert } from '../../stores/globalAlert'
import { useAdminPageLoader } from '../../hooks/useAdminPageLoader'
import AdminPageLoader from '../../components/admin/AdminPageLoader'
import Slider from "react-slick"

const ShowroomManagement: React.FC = () => {
  const navigate = useNavigate()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const { showrooms, loading, fetchShowrooms, deleteShowroom } = useSettingsStore()
  const { showConfirmation } = useConfirmation()

  // Parse working hours into structured format - same as PublicShowrooms
  const parseWorkingHours = (workingHours: string | null) => {
    // Hardcoded realistic business hours - in proper week order
    const schedule = [
      { day: "Luni", hours: "08:30 - 18:00" },
      { day: "Marți", hours: "08:30 - 18:00" },
      { day: "Miercuri", hours: "08:30 - 18:00" },
      { day: "Joi", hours: "08:30 - 18:00" },
      { day: "Vineri", hours: "08:30 - 18:00" },
      { day: "Sâmbătă", hours: "09:00 - 16:00" },
      { day: "Duminică", hours: "Închis" },
    ]
    return schedule
  }

  useEffect(() => {
    fetchShowrooms()
  }, [fetchShowrooms])

  // Use admin loader to prevent content flashing
  // Only consider data ready when loading is false
  const { showLoader } = useAdminPageLoader({
    minLoadTime: 1000,
    isLoading: loading,
    dependencies: [] // Don't rely on dependencies, just use isLoading
  })

  const handleEdit = (showroom: any) => {
    navigate(`/admin/showroom-uri/${showroom.id}/edit`)
  }

  const handleCreate = () => {
    navigate('/admin/showroom-uri/creeaza')
  }

  const handleDelete = async (id: number) => {
    const confirmed = await showConfirmation({
      title: 'Confirmă ștergerea',
      message: 'Ești sigur că vrei să ștergi acest showroom? Această acțiune nu poate fi anulată.',
      type: 'error'
    })

    if (!confirmed) return

    try {
      await deleteShowroom(id)
      showSuccessAlert('Showroom șters cu succes!', 'Success')
    } catch (error: any) {
      showErrorAlert(error.message, 'Error')
    }
  }

  if (showLoader) {
    return (
      <AdminPageLoader
        title="Se încarcă showroom-urile..."
        showSkeletons={true}
        skeletonCount={1}
        showBreadcrumb={true}
      />
    )
  }

  return (
    <Box>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Breadcrumbs>
            <Link href="/admin" color="inherit" sx={{ textDecoration: 'none' }}>
              Admin
            </Link>
            <Typography color="text.primary">Showroom-uri</Typography>
          </Breadcrumbs>
        </Box>

        <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
              Management Showrooms
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Gestionează showroom-urile afișate în site
            </Typography>
          </Box>
          <Tooltip title="Creează un showroom nou">
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={handleCreate}
              size="large"
              sx={{ borderRadius: 2 }}
            >
              Adaugă Showroom
            </Button>
          </Tooltip>
        </Box>
      </Container>

      {showrooms.length === 0 ? (
        <Container maxWidth="xl">
          <Paper
            sx={{
              p: 6,
              textAlign: 'center',
              borderRadius: 3,
              backgroundColor: 'grey.50'
            }}
          >
            <Store sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
              Niciun showroom găsit
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Creează primul showroom pentru a începe
            </Typography>
            <Tooltip title="Creează primul showroom">
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={handleCreate}
                size="large"
                sx={{ borderRadius: 2 }}
              >
                Adaugă primul showroom
              </Button>
            </Tooltip>
          </Paper>
        </Container>
      ) : (
        <Box
          sx={{
            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
            color: "text.primary",
            py: 4,
            mx: -3,
          }}
        >
          <Container maxWidth="xl">
            <Box
              sx={{
                ".slick-track": { display: "flex", alignItems: "stretch" },
                ".slick-slide": { padding: "0 4px" },
                ".slick-slide > div": { height: "100%" },
                overflow: "hidden",
                width: "100%",
                px: { xs: 2, md: 4 },
              }}
            >
              <Slider
                dots={true}
                infinite={showrooms.length > 1}
                speed={500}
                slidesToShow={1}
                slidesToScroll={1}
                autoplay={showrooms.length > 1}
                autoplaySpeed={5000}
                pauseOnHover={true}
                arrows={!isMobile}
                centerMode={false}
                variableWidth={false}
              >
                {showrooms.map((showroom) => {
                  const schedule = parseWorkingHours(showroom.opening_hours)

                  return (
                    <Box key={showroom.id} sx={{ px: { xs: 1, md: 2 } }}>
                      <Box sx={{ maxWidth: 800, mx: "auto" }}>
                        <Box
                          sx={{
                            overflow: "hidden",
                          }}
                        >
                          <Box
                            component="article"
                            aria-label={`Informații despre showroom-ul ${showroom.name}`}
                            onClick={() => handleEdit(showroom)}
                            sx={{
                              backgroundColor: "white",
                              borderRadius: 3,
                              overflow: "hidden",
                              boxShadow: theme.shadows[4],
                              p: 3,
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "center",
                              textAlign: "center",
                              position: "relative",
                              cursor: "pointer",
                              transition: "all 0.2s ease",
                              "&:hover": {
                                transform: "translateY(-2px)",
                                boxShadow: theme.shadows[8]
                              }
                            }}
                          >

                            {/* Showroom Title */}
                            <Typography
                              variant="h4"
                              component="h2"
                              aria-level="2"
                              sx={{
                                fontWeight: 700,
                                mb: 2,
                                fontSize: { xs: "1.5rem", md: "2rem" },
                                textAlign: "center",
                                background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.primary.dark} 90%)`,
                                backgroundClip: "text",
                                WebkitBackgroundClip: "text",
                                WebkitTextFillColor: "transparent"
                              }}
                            >
                              {showroom.name}
                            </Typography>

                            {/* Address + Phone */}
                            <Box
                              sx={{
                                display: "flex",
                                flexDirection: { xs: "column", sm: "row" },
                                alignItems: { xs: "center", sm: "center" },
                                gap: { xs: 1.5, sm: 6 },
                                mb: { xs: 2.5, md: 3 },
                                justifyContent: "center",
                                width: "100%",
                              }}
                            >
                              <Box
                                display="flex"
                                alignItems="center"
                                gap={1}
                                sx={{
                                  justifyContent: { xs: "center", sm: "flex-start" },
                                  textAlign: { xs: "center", sm: "left" },
                                  width: { xs: "100%", sm: "auto" },
                                }}
                              >
                                <LocationOn
                                  sx={{
                                    fontSize: 20,
                                    color: "primary.main",
                                    flexShrink: 0,
                                  }}
                                />
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                  sx={{
                                    fontWeight: 600,
                                    fontSize: { xs: "0.9375rem", md: "0.875rem" },
                                    lineHeight: 1.5,
                                    wordBreak: "break-word",
                                  }}
                                >
                                  {showroom.address}
                                </Typography>
                              </Box>

                              {showroom.phone && (
                                <Box
                                  display="flex"
                                  alignItems="center"
                                  gap={1}
                                  sx={{
                                    justifyContent: { xs: "center", sm: "flex-start" },
                                    width: { xs: "100%", sm: "auto" },
                                  }}
                                >
                                  <Phone
                                    sx={{
                                      fontSize: 20,
                                      color: "primary.main",
                                      flexShrink: 0,
                                    }}
                                  />
                                  <Typography
                                    variant="body2"
                                    color="text.secondary"
                                    sx={{
                                      fontWeight: 600,
                                      fontSize: { xs: "0.9375rem", md: "0.875rem" },
                                      lineHeight: 1.5,
                                    }}
                                  >
                                    {showroom.phone}
                                  </Typography>
                                </Box>
                              )}
                            </Box>

                            {/* Visual Divider 1 */}
                            <Box
                              sx={{
                                width: { xs: "80%", md: "100%" },
                                height: "1px",
                                background: `linear-gradient(90deg, transparent, ${theme.palette.primary.light}, transparent)`,
                                mb: { xs: 4, md: 3 },
                                mx: "auto",
                              }}
                            />

                            {/* Image + Working Hours */}
                            <Box
                              sx={{
                                display: "flex",
                                gap: { xs: 2.5, md: 3 },
                                mb: { xs: 3, md: 3 },
                                width: "100%",
                                alignItems: "center",
                                flexDirection: { xs: "column", md: "row" },
                              }}
                            >
                              {/* Image */}
                              <Box
                                sx={{
                                  width: { xs: "100%", md: 250 },
                                  height: { xs: 160, md: 200 },
                                  background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                                  position: "relative",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  borderRadius: 2,
                                  flexShrink: 0,
                                }}
                              >
                                <BusinessIcon
                                  sx={{
                                    fontSize: 60,
                                    color: "white",
                                    opacity: 0.3,
                                  }}
                                />
                              </Box>

                              {/* Working Hours */}
                              <Box sx={{ flex: 1, minWidth: 0, width: "100%" }}>
                                <Box
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    mb: { xs: 2.5, md: 2 },
                                    gap: 1,
                                    justifyContent: { xs: "center", md: "center" },
                                  }}
                                >
                                  <AccessTime
                                    sx={{ fontSize: { xs: 24, md: 20 }, color: "primary.main" }}
                                  />
                                  <Typography
                                    variant="h6"
                                    sx={{
                                      fontWeight: 600,
                                      color: "text.primary",
                                      fontSize: { xs: "1.125rem", md: "1.25rem" },
                                    }}
                                  >
                                    Program de lucru
                                  </Typography>
                                </Box>

                                {/* Mobile schedule display */}
                                <Box
                                  sx={{
                                    display: { xs: "block", md: "none" },
                                    backgroundColor: "background.paper",
                                    borderRadius: 3,
                                    overflow: "hidden",
                                    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                                    border: "1px solid",
                                    borderColor: "grey.200",
                                  }}
                                >
                                  {schedule.map((item, index) => {
                                    const today = new Date().getDay()
                                    const scheduleIndex = today === 0 ? 6 : today - 1
                                    const isToday = scheduleIndex === index
                                    const isClosed = item.hours === "Închis"

                                    return (
                                      <Box
                                        key={index}
                                        sx={{
                                          display: "flex",
                                          alignItems: "center",
                                          p: 2,
                                          backgroundColor: isToday ? "primary.50" : "transparent",
                                          borderBottom: index < schedule.length - 1 ? "1px solid" : "none",
                                          borderColor: "grey.100",
                                          position: "relative",
                                        }}
                                      >
                                        {isToday && (
                                          <Box
                                            sx={{
                                              position: "absolute",
                                              left: 0,
                                              top: "50%",
                                              transform: "translateY(-50%)",
                                              width: 4,
                                              height: "60%",
                                              backgroundColor: "primary.main",
                                              borderRadius: "0 4px 4px 0",
                                            }}
                                          />
                                        )}

                                        <Typography
                                          sx={{
                                            fontWeight: isToday ? 700 : 600,
                                            fontSize: "0.9375rem",
                                            color: isToday ? "primary.main" : "text.primary",
                                            width: 100,
                                            pl: isToday ? 1 : 0,
                                          }}
                                        >
                                          {item.day}
                                          {isToday && (
                                            <Typography
                                              component="span"
                                              sx={{
                                                fontSize: "0.75rem",
                                                color: "primary.main",
                                                fontWeight: 400,
                                                display: "block",
                                              }}
                                            >
                                              (Astăzi)
                                            </Typography>
                                          )}
                                        </Typography>

                                        <Typography
                                          sx={{
                                            fontSize: "0.9375rem",
                                            fontWeight: isClosed ? 600 : 500,
                                            color: isClosed ? "error.main" : isToday ? "primary.dark" : "text.secondary",
                                            textAlign: "right",
                                            flex: 1,
                                          }}
                                        >
                                          {item.hours}
                                        </Typography>
                                      </Box>
                                    )
                                  })}
                                </Box>

                                {/* Desktop schedule display */}
                                <Paper
                                  elevation={0}
                                  component="section"
                                  aria-label={`Program de lucru pentru ${showroom.name}`}
                                  sx={{
                                    display: { xs: "none", md: "flex" },
                                    flexDirection: "column",
                                    backgroundColor: "grey.50",
                                    borderRadius: 2,
                                    p: 1.5,
                                    gap: 0.5,
                                  }}
                                >
                                  {schedule.map((item, index) => {
                                    const today = new Date().getDay()
                                    const scheduleIndex = today === 0 ? 6 : today - 1
                                    const isToday = scheduleIndex === index
                                    const isClosed = item.hours === "Închis"

                                    return (
                                      <Box key={index}>
                                        <Box
                                          sx={{
                                            display: "flex",
                                            justifyContent: "space-between",
                                            alignItems: "center",
                                            py: 0.75,
                                            px: 1.5,
                                            borderRadius: 1,
                                            transition: "background-color 0.2s",
                                            minHeight: 40,
                                            backgroundColor: isToday ? "primary.50" : "transparent",
                                            position: "relative",
                                            "&:hover": {
                                              backgroundColor: isToday ? "primary.100" : "action.hover",
                                            },
                                          }}
                                        >
                                          {isToday && (
                                            <Box
                                              sx={{
                                                position: "absolute",
                                                left: 0,
                                                top: "50%",
                                                transform: "translateY(-50%)",
                                                width: 3,
                                                height: "70%",
                                                backgroundColor: "primary.main",
                                                borderRadius: "0 2px 2px 0",
                                              }}
                                            />
                                          )}
                                          <Typography
                                            variant="body2"
                                            sx={{
                                              fontWeight: isToday ? 600 : 500,
                                              minWidth: 80,
                                              color: isToday ? "primary.main" : "text.primary",
                                              fontSize: "0.875rem",
                                              lineHeight: 1.4,
                                              flex: 1,
                                              pl: isToday ? 1 : 0,
                                            }}
                                          >
                                            {item.day}
                                            {isToday && (
                                              <Typography
                                                component="span"
                                                sx={{
                                                  fontSize: "0.75rem",
                                                  color: "primary.main",
                                                  fontWeight: 400,
                                                  ml: 0.5,
                                                }}
                                              >
                                                (Astăzi)
                                              </Typography>
                                            )}
                                          </Typography>
                                          <Typography
                                            variant="body2"
                                            color={
                                              isClosed
                                                ? "error.main"
                                                : isToday
                                                ? "primary.dark"
                                                : "text.primary"
                                            }
                                            sx={{
                                              fontWeight: isClosed ? 600 : isToday ? 600 : 500,
                                              textAlign: "right",
                                              fontSize: "0.875rem",
                                              lineHeight: 1.4,
                                              flex: 1,
                                              display: "flex",
                                              justifyContent: "flex-end",
                                            }}
                                          >
                                            {item.hours}
                                          </Typography>
                                        </Box>
                                        {index < schedule.length - 1 && (
                                          <Box
                                            sx={{
                                              borderBottom: "1px solid",
                                              borderColor: "divider",
                                              my: 0.5,
                                              width: "100%",
                                              opacity: 0.5,
                                            }}
                                          />
                                        )}
                                      </Box>
                                    )
                                  })}
                                </Paper>
                              </Box>
                            </Box>

                            {/* Visual Divider 2 */}
                            <Box
                              sx={{
                                width: { xs: "80%", md: "100%" },
                                height: "1px",
                                background: `linear-gradient(90deg, transparent, ${theme.palette.primary.light}, transparent)`,
                                mb: { xs: 2.5, md: 3 },
                                mx: "auto",
                              }}
                            />

                            {/* Navigation Links */}
                            <Box
                              component="nav"
                              aria-label="Link-uri pentru navigație"
                              sx={{
                                display: "flex",
                                gap: 6,
                                justifyContent: "center",
                                alignItems: "center",
                              }}
                            >
                              {/* Google Maps Icon */}
                              <Box
                                component={showroom.google_maps_url ? "a" : "div"}
                                href={showroom.google_maps_url || undefined}
                                target={showroom.google_maps_url ? "_blank" : undefined}
                                rel={showroom.google_maps_url ? "noopener noreferrer" : undefined}
                                onClick={
                                  !showroom.google_maps_url
                                    ? (e) => {
                                        e.preventDefault()
                                        const fallbackUrl = `https://maps.google.com/?q=${encodeURIComponent(
                                          showroom.address
                                        )}`
                                        window.open(fallbackUrl, "_blank", "noopener,noreferrer")
                                      }
                                    : undefined
                                }
                                sx={{
                                  display: "block",
                                  width: { xs: 56, md: 56 },
                                  height: { xs: 56, md: 56 },
                                  borderRadius: 2,
                                  overflow: "hidden",
                                  transition: "all 0.2s ease",
                                  cursor: "pointer",
                                  textDecoration: "none",
                                  "&:hover": {
                                    transform: "scale(1.05)",
                                    boxShadow: theme.shadows[4],
                                  },
                                }}
                                title="Deschide în Google Maps"
                                aria-label="Deschide locația în Google Maps"
                              >
                                <Box
                                  component="img"
                                  src="/google-map-icon.png"
                                  alt="Google Maps"
                                  sx={{
                                    width: "100%",
                                    height: "100%",
                                    objectFit: "contain",
                                  }}
                                />
                              </Box>

                              {/* Waze Icon */}
                              <Box
                                component={showroom.waze_url ? "a" : "div"}
                                href={showroom.waze_url || undefined}
                                target={showroom.waze_url ? "_blank" : undefined}
                                rel={showroom.waze_url ? "noopener noreferrer" : undefined}
                                onClick={
                                  !showroom.waze_url
                                    ? (e) => {
                                        e.preventDefault()
                                        const fallbackUrl = `https://waze.com/ul?q=${encodeURIComponent(
                                          showroom.address
                                        )}`
                                        window.open(fallbackUrl, "_blank", "noopener,noreferrer")
                                      }
                                    : undefined
                                }
                                sx={{
                                  display: "block",
                                  width: { xs: 56, md: 56 },
                                  height: { xs: 56, md: 56 },
                                  borderRadius: 2,
                                  overflow: "hidden",
                                  transition: "all 0.2s ease",
                                  cursor: "pointer",
                                  textDecoration: "none",
                                  "&:hover": {
                                    transform: "scale(1.05)",
                                    boxShadow: theme.shadows[4],
                                  },
                                }}
                                title="Deschide în Waze"
                                aria-label="Deschide locația în Waze"
                              >
                                <Box
                                  component="img"
                                  src="/waze.png"
                                  alt="Waze"
                                  sx={{
                                    width: "100%",
                                    height: "100%",
                                    objectFit: "contain",
                                  }}
                                />
                              </Box>
                            </Box>
                          </Box>
                        </Box>
                      </Box>
                    </Box>
                  )
                })}
              </Slider>
            </Box>
          </Container>
        </Box>
      )}
    </Box>
  )
}

export default ShowroomManagement