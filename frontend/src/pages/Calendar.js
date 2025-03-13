import { useState, useEffect } from "react";
import {
  Box,
  Container,
  Paper,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  useTheme,
  FormControlLabel,
  Checkbox,
  Alert,
} from "@mui/material";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { useUser } from "../contexts/UserContext";
import DeleteIcon from "@mui/icons-material/Delete";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import axios from "axios";

function Calendar() {
  const theme = useTheme();
  const { user } = useUser();
  const [events, setEvents] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [openEventDialog, setOpenEventDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [newEvent, setNewEvent] = useState({
    title: "",
    start: "",
    end: "",
    description: "",
    type: "meeting",
  });
  const [isAllDay, setIsAllDay] = useState(false);

  // Function to handle success messages with auto-dismissal
  const showSuccessMessage = (message) => {
    setSuccess(message);
    setTimeout(() => {
      setSuccess("");
    }, 3000); // Message will disappear after 3 seconds
  };

  // Fetch events when component mounts
  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await axios.get(`/api/events?userId=${user.id}`);
      if (response.data.ok) {
        // Filter out completed events
        const activeEvents = response.data.events.filter(
          (event) => !event.completed
        );
        setEvents(activeEvents);
      } else {
        setError(response.data.message);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Error fetching events");
      console.error("Error fetching events:", err);
    } finally {
      setLoading(false);
    }
  };

  // Add custom CSS for dark mode grid lines
  const calendarClassNames = {
    root: theme.palette.mode === "dark" ? "dark-calendar" : "",
  };

  const handleDateSelect = (selectInfo) => {
    setSelectedDate(selectInfo);
    const startDate = new Date(selectInfo.start);
    const endDate = new Date(selectInfo.end);

    // Format the dates for the input fields
    const formattedStart = startDate.toISOString().slice(0, 16); // Format: YYYY-MM-DDTHH:mm
    const formattedEnd = endDate.toISOString().slice(0, 16);

    setNewEvent({
      title: "",
      start: formattedStart,
      end: formattedEnd,
      description: "",
      type: "meeting",
    });
    setIsAllDay(false);
    setOpenDialog(true);
  };

  const handleEventClick = (clickInfo) => {
    setSelectedEvent(clickInfo.event);
    setOpenEventDialog(true);
  };

  const handleCloseEventDialog = () => {
    setOpenEventDialog(false);
    setSelectedEvent(null);
  };

  const handleDeleteEvent = async () => {
    if (selectedEvent) {
      try {
        setLoading(true);
        setError("");
        setSuccess("");

        const response = await axios.delete(`/api/events/${selectedEvent.id}`);
        if (response.data.ok) {
          setEvents(events.filter((event) => event.id !== selectedEvent.id));
          showSuccessMessage("Event deleted successfully!");
          handleCloseEventDialog();
        } else {
          setError(response.data.message);
        }
      } catch (err) {
        setError(err.response?.data?.message || "Error deleting event");
        console.error("Error deleting event:", err);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleCompleteEvent = async () => {
    if (selectedEvent) {
      try {
        setLoading(true);
        setError("");
        setSuccess("");

        const updatedEvent = {
          background_color: theme.palette.grey[500],
          text_color: theme.palette.grey[100],
          completed: 1,
        };

        const response = await axios.put(
          `/api/events/${selectedEvent.id}`,
          updatedEvent
        );
        if (response.data.ok) {
          // Fetch the latest events after completing
          await fetchEvents();
          showSuccessMessage("Event marked as completed!");
          handleCloseEventDialog();
        } else {
          setError(response.data.message);
        }
      } catch (err) {
        setError(err.response?.data?.message || "Error completing event");
        console.error("Error completing event:", err);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setNewEvent({
      title: "",
      start: "",
      end: "",
      description: "",
      type: "meeting",
    });
    setIsAllDay(false);
  };

  const handleSubmitEvent = async () => {
    if (newEvent.title.trim()) {
      try {
        setLoading(true);
        setError("");
        setSuccess("");

        const eventData = {
          title: newEvent.title,
          start: newEvent.start,
          end: newEvent.end,
          description: newEvent.description,
          type: newEvent.type,
          all_day: isAllDay,
          background_color: getEventColor(newEvent.type),
          user_id: user.id,
        };

        // If it's an all-day event, remove the time component
        if (isAllDay) {
          eventData.start = eventData.start.split("T")[0];
          eventData.end = eventData.end.split("T")[0];
        }

        const response = await axios.post("/api/events", eventData);
        if (response.data.ok) {
          setEvents([...events, response.data.event]);
          showSuccessMessage("Event created successfully!");
          handleCloseDialog();
        } else {
          setError(response.data.message);
        }
      } catch (err) {
        setError(err.response?.data?.message || "Error creating event");
        console.error("Error creating event:", err);
      } finally {
        setLoading(false);
      }
    }
  };

  const getEventColor = (type) => {
    switch (type) {
      case "meeting":
        return theme.palette.primary.main;
      case "deadline":
        return theme.palette.error.main;
      case "reminder":
        return theme.palette.warning.main;
      default:
        return theme.palette.primary.main;
    }
  };

  const getEventStyle = (type) => {
    const color = getEventColor(type);
    if (type === "deadline") {
      return {
        backgroundColor: color,
        borderColor: color,
      };
    }
    return {
      backgroundColor: "transparent",
      borderColor: "transparent",
      color: theme.palette.text.primary,
    };
  };

  return (
    <Box
      sx={{
        height: "calc(99vh - 64px)",
        py: 1,
        bgcolor:
          theme.palette.mode === "light" ? "grey.50" : "background.default",
      }}
    >
      <Container maxWidth="lg" sx={{ height: "100%" }}>
        <Paper
          elevation={0}
          sx={{
            height: "100%",
            p: 1.5,
            border: "1px solid",
            borderColor: "divider",
            bgcolor: theme.palette.background.paper,
            display: "flex",
            flexDirection: "column",
          }}
        >
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {success}
            </Alert>
          )}
          <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 1 }}>
            <Button
              variant="contained"
              onClick={() => {
                const now = new Date();
                const currentDateTime = now.toISOString().slice(0, 16);
                const endDateTime = new Date(now.getTime() + 60 * 60 * 1000)
                  .toISOString()
                  .slice(0, 16);
                setNewEvent({
                  title: "",
                  start: currentDateTime,
                  end: endDateTime,
                  description: "",
                  type: "meeting",
                });
                setOpenDialog(true);
              }}
            >
              Add Event
            </Button>
          </Box>
          <Box sx={{ flex: 1, minHeight: 0 }}>
            {loading ? (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  height: "100%",
                }}
              >
                <Typography>Loading events...</Typography>
              </Box>
            ) : (
              <FullCalendar
                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                headerToolbar={{
                  left: "prev,next today",
                  center: "title",
                  right: "dayGridMonth,timeGridWeek,timeGridDay",
                }}
                initialView="dayGridMonth"
                editable={true}
                selectable={true}
                selectMirror={true}
                dayMaxEvents={true}
                weekends={true}
                events={events}
                select={handleDateSelect}
                eventClick={handleEventClick}
                height="100%"
                themeSystem={theme.palette.mode}
                className={calendarClassNames.root}
                eventDidMount={(info) => {
                  const style = getEventStyle(info.event.extendedProps.type);
                  Object.assign(info.el.style, style);
                }}
                eventContent={(eventInfo) => {
                  if (eventInfo.event.extendedProps.type === "deadline") {
                    return {
                      html: `<div style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${eventInfo.event.title}</div>`,
                    };
                  }
                  const time = eventInfo.timeText;
                  const color = getEventColor(
                    eventInfo.event.extendedProps.type
                  );
                  return {
                    html: `<div style="display: flex; align-items: center; white-space: nowrap; overflow: hidden;">
                      <span style="flex-shrink: 0; width: 8px; height: 8px; border-radius: 50%; background-color: ${color}; margin-right: 6px;"></span>
                      <span style="flex: 1; overflow: hidden; text-overflow: ellipsis;">${eventInfo.event.title}</span>
                      <span style="flex-shrink: 0; margin-left: 6px;">${time}</span>
                    </div>`,
                  };
                }}
              />
            )}
          </Box>
        </Paper>
      </Container>

      {/* Event Details Dialog */}
      <Dialog
        open={openEventDialog}
        onClose={handleCloseEventDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: theme.palette.background.paper,
            color: theme.palette.text.primary,
          },
        }}
      >
        <DialogTitle
          sx={{
            borderBottom: `1px solid ${theme.palette.divider}`,
            pb: 2,
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          {selectedEvent && (
            <>
              <span
                style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  backgroundColor: getEventColor(
                    selectedEvent.extendedProps.type
                  ),
                }}
              />
              {selectedEvent.title}
            </>
          )}
        </DialogTitle>
        <DialogContent>
          {selectedEvent && (
            <Box
              sx={{ pt: 2, display: "flex", flexDirection: "column", gap: 2 }}
            >
              <Box sx={{ display: "flex", gap: 2 }}>
                <TextField
                  label="Start"
                  value={new Date(selectedEvent.start).toLocaleString()}
                  fullWidth
                  disabled
                  sx={{
                    "& .MuiInputLabel-root": {
                      color: theme.palette.text.secondary,
                    },
                    "& .MuiOutlinedInput-root": {
                      "& fieldset": {
                        borderColor: theme.palette.divider,
                      },
                      "& input": {
                        color: theme.palette.text.primary,
                      },
                    },
                  }}
                />
                <TextField
                  label="End"
                  value={new Date(selectedEvent.end).toLocaleString()}
                  fullWidth
                  disabled
                  sx={{
                    "& .MuiInputLabel-root": {
                      color: theme.palette.text.secondary,
                    },
                    "& .MuiOutlinedInput-root": {
                      "& fieldset": {
                        borderColor: theme.palette.divider,
                      },
                      "& input": {
                        color: theme.palette.text.primary,
                      },
                    },
                  }}
                />
              </Box>
              <TextField
                label="Type"
                value={
                  selectedEvent.extendedProps.type.charAt(0).toUpperCase() +
                  selectedEvent.extendedProps.type.slice(1)
                }
                fullWidth
                disabled
                sx={{
                  "& .MuiInputLabel-root": {
                    color: theme.palette.text.secondary,
                  },
                  "& .MuiOutlinedInput-root": {
                    "& fieldset": {
                      borderColor: theme.palette.divider,
                    },
                    "& input": {
                      color: theme.palette.text.primary,
                    },
                  },
                }}
              />
              <TextField
                label="Description"
                value={
                  selectedEvent.extendedProps.description || "No description"
                }
                fullWidth
                multiline
                rows={3}
                disabled
                sx={{
                  "& .MuiInputLabel-root": {
                    color: theme.palette.text.secondary,
                  },
                  "& .MuiOutlinedInput-root": {
                    "& fieldset": {
                      borderColor: theme.palette.divider,
                    },
                    "& textarea": {
                      color: theme.palette.text.primary,
                    },
                  },
                }}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions
          sx={{
            borderTop: `1px solid ${theme.palette.divider}`,
            pt: 2,
            px: 3,
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <Box>
            <Button
              onClick={handleCompleteEvent}
              color="success"
              startIcon={<CheckCircleIcon />}
              sx={{ mr: 1 }}
            >
              Complete
            </Button>
            <Button
              onClick={handleDeleteEvent}
              color="error"
              startIcon={<DeleteIcon />}
            >
              Delete
            </Button>
          </Box>
          <Button onClick={handleCloseEventDialog}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Add Event Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: theme.palette.background.paper,
            color: theme.palette.text.primary,
          },
        }}
      >
        <DialogTitle
          sx={{
            borderBottom: `1px solid ${theme.palette.divider}`,
            pb: 2,
          }}
        >
          Add New Event
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField
              label="Event Title"
              fullWidth
              value={newEvent.title}
              onChange={(e) =>
                setNewEvent({ ...newEvent, title: e.target.value })
              }
              sx={{
                "& .MuiInputLabel-root": {
                  color: theme.palette.text.secondary,
                },
                "& .MuiOutlinedInput-root": {
                  "& fieldset": {
                    borderColor: theme.palette.divider,
                  },
                  "&:hover fieldset": {
                    borderColor: theme.palette.primary.main,
                  },
                  "& input": {
                    color: theme.palette.text.primary,
                  },
                },
              }}
            />
            <Box
              sx={{
                display: "flex",
                gap: 2,
                flexDirection: { xs: "column", sm: "row" },
              }}
            >
              <TextField
                label="Start Date & Time"
                type={isAllDay ? "date" : "datetime-local"}
                fullWidth
                value={newEvent.start}
                onChange={(e) =>
                  setNewEvent({ ...newEvent, start: e.target.value })
                }
                InputLabelProps={{
                  shrink: true,
                }}
                sx={{
                  "& .MuiInputLabel-root": {
                    color: theme.palette.text.secondary,
                  },
                  "& .MuiOutlinedInput-root": {
                    "& fieldset": {
                      borderColor: theme.palette.divider,
                    },
                    "&:hover fieldset": {
                      borderColor: theme.palette.primary.main,
                    },
                    "& input": {
                      color: theme.palette.text.primary,
                      "&::-webkit-calendar-picker-indicator": {
                        filter:
                          theme.palette.mode === "dark" ? "invert(1)" : "none",
                        opacity: 0.7,
                        "&:hover": {
                          opacity: 1,
                        },
                      },
                    },
                  },
                }}
              />
              <TextField
                label="End Date & Time"
                type={isAllDay ? "date" : "datetime-local"}
                fullWidth
                value={newEvent.end}
                onChange={(e) =>
                  setNewEvent({ ...newEvent, end: e.target.value })
                }
                InputLabelProps={{
                  shrink: true,
                }}
                sx={{
                  "& .MuiInputLabel-root": {
                    color: theme.palette.text.secondary,
                  },
                  "& .MuiOutlinedInput-root": {
                    "& fieldset": {
                      borderColor: theme.palette.divider,
                    },
                    "&:hover fieldset": {
                      borderColor: theme.palette.primary.main,
                    },
                    "& input": {
                      color: theme.palette.text.primary,
                      "&::-webkit-calendar-picker-indicator": {
                        filter:
                          theme.palette.mode === "dark" ? "invert(1)" : "none",
                        opacity: 0.7,
                        "&:hover": {
                          opacity: 1,
                        },
                      },
                    },
                  },
                }}
              />
            </Box>
            <FormControlLabel
              control={
                <Checkbox
                  checked={isAllDay}
                  onChange={(e) => {
                    setIsAllDay(e.target.checked);
                    if (e.target.checked) {
                      // Convert to date-only format
                      setNewEvent({
                        ...newEvent,
                        start: newEvent.start.split("T")[0],
                        end: newEvent.end.split("T")[0],
                      });
                    } else {
                      // Convert back to datetime format
                      const now = new Date();
                      const currentDateTime = now.toISOString().slice(0, 16);
                      const endDateTime = new Date(
                        now.getTime() + 60 * 60 * 1000
                      )
                        .toISOString()
                        .slice(0, 16);
                      setNewEvent({
                        ...newEvent,
                        start: newEvent.start
                          ? `${newEvent.start}T00:00`
                          : currentDateTime,
                        end: newEvent.end
                          ? `${newEvent.end}T00:00`
                          : endDateTime,
                      });
                    }
                  }}
                  sx={{
                    color: theme.palette.text.secondary,
                    "&.Mui-checked": {
                      color: theme.palette.primary.main,
                    },
                  }}
                />
              }
              label="All Day Event"
              sx={{ color: theme.palette.text.secondary }}
            />
            <TextField
              label="Event Type"
              select
              fullWidth
              value={newEvent.type}
              onChange={(e) =>
                setNewEvent({ ...newEvent, type: e.target.value })
              }
              sx={{
                "& .MuiInputLabel-root": {
                  color: theme.palette.text.secondary,
                },
                "& .MuiOutlinedInput-root": {
                  "& fieldset": {
                    borderColor: theme.palette.divider,
                  },
                  "&:hover fieldset": {
                    borderColor: theme.palette.primary.main,
                  },
                  "& .MuiSelect-select": {
                    color: theme.palette.text.primary,
                  },
                },
              }}
            >
              <MenuItem value="meeting">Meeting</MenuItem>
              <MenuItem value="deadline">Deadline</MenuItem>
              <MenuItem value="reminder">Reminder</MenuItem>
            </TextField>
            <TextField
              label="Description"
              fullWidth
              multiline
              rows={3}
              value={newEvent.description}
              onChange={(e) =>
                setNewEvent({ ...newEvent, description: e.target.value })
              }
              sx={{
                "& .MuiInputLabel-root": {
                  color: theme.palette.text.secondary,
                },
                "& .MuiOutlinedInput-root": {
                  "& fieldset": {
                    borderColor: theme.palette.divider,
                  },
                  "&:hover fieldset": {
                    borderColor: theme.palette.primary.main,
                  },
                  "& textarea": {
                    color: theme.palette.text.primary,
                  },
                },
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions
          sx={{
            borderTop: `1px solid ${theme.palette.divider}`,
            pt: 2,
            px: 3,
          }}
        >
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmitEvent} variant="contained">
            Add Event
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default Calendar;
