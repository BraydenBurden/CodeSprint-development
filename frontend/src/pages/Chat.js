import {
  Box,
  Container,
  Paper,
  Grid,
  TextField,
  IconButton,
  Typography,
  Avatar,
  Divider,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  useTheme,
  useMediaQuery,
  Drawer,
} from "@mui/material";
import { SendOutlined, SearchOutlined, MenuOutlined } from "@ant-design/icons";
import { useState, useEffect, useCallback, useRef } from "react";
import { useUser } from "../contexts/UserContext";
import { socket } from "../socket";
import axios from "axios";

function Chat() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [message, setMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUsersList, setShowUsersList] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [lastMessageTime, setLastMessageTime] = useState(null);
  const { user } = useUser();
  const messageContainerRef = useRef(null);

  const fetchMessages = useCallback(async (conversationId) => {
    try {
      console.log("Fetching messages for conversation:", conversationId);
      const response = await axios.get(
        `/api/chat/conversations/${conversationId}/messages`
      );

      if (response.data.ok) {
        setMessages(response.data.messages);
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  }, []);

  // Fetch conversations when component mounts
  useEffect(() => {
    console.log("Chat component mounted, user:", user);
    if (user) {
      console.log("User exists, fetching conversations");
      fetchConversations();
    } else {
      console.log("No user found, skipping fetch");
    }
  }, [user]);

  // Fetch messages when a user is selected
  useEffect(() => {
    if (selectedUser) {
      fetchMessages(selectedUser.id);
      setLastMessageTime(null);
    }
  }, [selectedUser, fetchMessages]);

  // Socket.IO event listeners
  useEffect(() => {
    console.log("Setting up socket listeners");

    const handleNewMessage = (message) => {
      console.log("Received new message via socket:", message);

      // Always update conversations list first
      setConversations((prevConversations) => {
        const updatedConversations = prevConversations.map((conv) => {
          if (conv.id === message.conversation_id) {
            console.log("Updating conversation:", conv.id);
            return {
              ...conv,
              last_message: message.content,
              last_message_time: "Just now",
            };
          }
          return conv;
        });
        console.log("Updated conversations:", updatedConversations);
        return updatedConversations;
      });

      // Update messages if we're in the relevant conversation
      if (selectedUser && message.conversation_id === selectedUser.id) {
        console.log("Adding message to current conversation");
        setMessages((prev) => {
          // Check if message already exists to prevent duplicates
          const messageExists = prev.some((m) => m.id === message.id);
          if (!messageExists) {
            console.log("Message doesn't exist, adding to state");
            return [...prev, message];
          }
          console.log("Message already exists, not adding");
          return prev;
        });
      } else {
        console.log(
          "Message is for a different conversation:",
          message.conversation_id
        );
      }
    };

    // Join all conversations
    conversations.forEach((conv) => {
      console.log("Joining conversation room:", conv.id);
      socket.emit("join_conversation", conv.id);
    });

    // Set up socket event listener
    socket.on("new_message", handleNewMessage);

    // Debug: Log socket connection status
    console.log("Socket connected:", socket.connected);
    console.log("Current socket ID:", socket.id);
    console.log("Current conversations:", conversations);

    // Cleanup function
    return () => {
      console.log("Cleaning up socket listeners");
      conversations.forEach((conv) => {
        console.log("Leaving conversation room:", conv.id);
        socket.emit("leave_conversation", conv.id);
      });
      socket.off("new_message", handleNewMessage);
    };
  }, [selectedUser, conversations]);

  const fetchConversations = async () => {
    try {
      console.log("Fetching conversations for user:", user.id);
      const response = await axios.get(`/api/chat/conversations/${user.id}`);
      console.log("Conversations response:", response.data);

      if (response.data.ok) {
        console.log("Setting conversations:", response.data.conversations);
        setConversations(response.data.conversations);
        // Force a re-render of the mobile drawer if it's open
        if (isMobile && showUsersList) {
          setShowUsersList(false);
          setTimeout(() => setShowUsersList(true), 0);
        }
      } else {
        console.error("Failed to fetch conversations:", response.data.message);
      }
    } catch (error) {
      console.error("Error fetching conversations:", error);
      console.error("Error details:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (message.trim() && selectedUser) {
      try {
        console.log("Sending message to conversation:", selectedUser.id);
        const response = await axios.post(
          `/api/chat/conversations/${selectedUser.id}/messages`,
          {
            senderId: user.id,
            content: message.trim(),
          }
        );

        if (response.data.ok) {
          // Clear input first to prevent duplicate sends
          setMessage("");

          // Don't update the UI here, let the socket event handle it
          console.log("Message sent successfully, waiting for socket event");
        }
      } catch (error) {
        console.error("Error sending message:", error);
      }
    }
  };

  // Filter conversations based on search query
  const filteredConversations = conversations.filter((conv) => {
    const searchLower = searchQuery.toLowerCase();
    const matches =
      conv.participant.firstName.toLowerCase().includes(searchLower) ||
      conv.participant.lastName.toLowerCase().includes(searchLower) ||
      (conv.last_message &&
        conv.last_message.toLowerCase().includes(searchLower));
    console.log("Filtering conversation:", conv, "matches:", matches);
    return matches;
  });

  const handleUserSelect = (conversation) => {
    console.log("Selecting conversation:", conversation);
    setSelectedUser(conversation);
    if (isMobile) {
      setShowUsersList(false);
    }
  };

  const renderUsersList = () => (
    <Paper
      elevation={0}
      sx={{
        height: "100%",
        border: "1px solid",
        borderColor: "divider",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Box sx={{ p: 2, borderBottom: "1px solid", borderColor: "divider" }}>
        <Typography variant="h6">Messages</Typography>
      </Box>
      <Box sx={{ p: 1 }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Search messages..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <SearchOutlined style={{ marginRight: 8, color: "gray" }} />
            ),
          }}
        />
      </Box>
      <List sx={{ flexGrow: 1, overflow: "auto" }}>
        {filteredConversations.map((conv) => (
          <ListItem
            key={conv.id}
            button
            selected={selectedUser?.id === conv.id}
            onClick={() => handleUserSelect(conv)}
            sx={{
              "&:hover": {
                bgcolor: theme.palette.action.hover,
              },
            }}
          >
            <ListItemAvatar>
              <Avatar>{conv.participant.firstName[0]}</Avatar>
            </ListItemAvatar>
            <ListItemText
              primary={`${conv.participant.firstName} ${conv.participant.lastName}`}
              secondary={
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {conv.last_message || "No messages yet"}
                </Typography>
              }
            />
            <Typography variant="caption" color="text.secondary">
              {conv.last_message_time || "Just now"}
            </Typography>
          </ListItem>
        ))}
      </List>
    </Paper>
  );

  // Add console log for conversations state
  useEffect(() => {
    console.log("Current conversations state:", conversations);
    console.log("Filtered conversations:", filteredConversations);
    console.log("Selected user:", selectedUser);
    console.log("Is mobile:", isMobile);
    console.log("Show users list:", showUsersList);
  }, [
    conversations,
    filteredConversations,
    selectedUser,
    isMobile,
    showUsersList,
  ]);

  // Fetch conversations when component mounts or when mobile state changes
  useEffect(() => {
    if (user) {
      console.log(
        "User changed or mobile state changed, fetching conversations"
      );
      fetchConversations();
    }
  }, [user, isMobile]);

  // Add scroll to bottom effect
  const scrollToBottom = () => {
    if (messageContainerRef.current) {
      const container = messageContainerRef.current;
      container.scrollTop = container.scrollHeight;
    }
  };

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <Box
      sx={{
        height: isMobile ? "calc(100dvh - 70px)" : "calc(100vh - 70px)",
        bgcolor:
          theme.palette.mode === "light" ? "grey.50" : "background.default",
        overflow: "hidden",
        ...(isMobile
          ? {
              position: "fixed",
              top: "64px",
              left: 0,
              right: 0,
              bottom: 0,
            }
          : {}),
      }}
    >
      <Container
        maxWidth="xl"
        sx={{
          height: "100%",
          py: isMobile ? 0 : 2,
          overflow: "hidden",
          position: "relative",
        }}
      >
        <Grid
          container
          spacing={isMobile ? 0 : 2}
          sx={{
            height: "100%",
            overflow: "hidden",
            position: "relative",
          }}
        >
          {/* Users List - Desktop */}
          {!isMobile && (
            <Grid item xs={12} md={4}>
              {renderUsersList()}
            </Grid>
          )}

          {/* Chat Area */}
          <Grid item xs={12} md={isMobile ? 12 : 8}>
            <Paper
              elevation={0}
              sx={{
                height: "100%",
                border: "1px solid",
                borderColor: "divider",
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
              }}
            >
              {/* Chat Header */}
              <Box
                sx={{
                  p: 2,
                  borderBottom: "1px solid",
                  borderColor: "divider",
                  display: "flex",
                  alignItems: "center",
                  flexShrink: 0,
                }}
              >
                {isMobile && (
                  <IconButton
                    onClick={() => {
                      console.log("Opening mobile drawer");
                      console.log("Current conversations:", conversations);
                      console.log(
                        "Filtered conversations:",
                        filteredConversations
                      );
                      setShowUsersList(true);
                    }}
                    sx={{ mr: 2 }}
                  >
                    <MenuOutlined />
                  </IconButton>
                )}
                {selectedUser ? (
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <Avatar sx={{ mr: 2 }}>
                      {selectedUser.participant.firstName[0]}
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle1">
                        {`${selectedUser.participant.firstName} ${selectedUser.participant.lastName}`}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Online
                      </Typography>
                    </Box>
                  </Box>
                ) : (
                  <Typography variant="subtitle1" color="text.secondary">
                    Select a conversation
                  </Typography>
                )}
              </Box>

              {/* Messages */}
              <Box
                sx={{
                  flex: 1,
                  overflow: "hidden",
                  position: "relative",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <Box
                  ref={messageContainerRef}
                  sx={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    overflowY: "auto",
                    px: 2,
                    py: 2,
                    display: "flex",
                    flexDirection: "column",
                    width: "100%",
                  }}
                >
                  {selectedUser ? (
                    <Box sx={{ width: "100%" }}>
                      {messages.map((msg) => (
                        <Box
                          key={msg.id}
                          sx={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems:
                              msg.sender_id === user.id
                                ? "flex-end"
                                : "flex-start",
                            width: "100%",
                            mb: 2,
                          }}
                        >
                          <Box
                            sx={{
                              maxWidth: "70%",
                              width: "fit-content",
                            }}
                          >
                            <Paper
                              elevation={0}
                              sx={{
                                p: 1.5,
                                bgcolor:
                                  msg.sender_id === user.id
                                    ? "primary.main"
                                    : "background.paper",
                                color:
                                  msg.sender_id === user.id
                                    ? "white"
                                    : "text.primary",
                                borderRadius: 2,
                                border: "1px solid",
                                borderColor: "divider",
                                width: "100%",
                              }}
                            >
                              <Typography variant="body1">
                                {msg.content}
                              </Typography>
                            </Paper>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{
                                mt: 0.5,
                                display: "block",
                                textAlign:
                                  msg.sender_id === user.id ? "right" : "left",
                              }}
                            >
                              {new Date(msg.created_at).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </Typography>
                          </Box>
                        </Box>
                      ))}
                    </Box>
                  ) : (
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        height: "100%",
                      }}
                    >
                      <Typography color="text.secondary">
                        Select a conversation to start messaging
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Box>

              {/* Message Input */}
              <Box
                sx={{
                  p: 2,
                  borderTop: "1px solid",
                  borderColor: "divider",
                  flexShrink: 0,
                }}
              >
                <form onSubmit={handleSendMessage}>
                  <Box sx={{ display: "flex", gap: 1 }}>
                    <TextField
                      fullWidth
                      size="small"
                      placeholder="Type a message..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      disabled={!selectedUser}
                    />
                    <IconButton
                      type="submit"
                      color="primary"
                      disabled={!message.trim() || !selectedUser}
                      sx={{
                        bgcolor: "primary.main",
                        color: "white",
                        "&:hover": {
                          bgcolor: "primary.dark",
                        },
                      }}
                    >
                      <SendOutlined />
                    </IconButton>
                  </Box>
                </form>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Container>

      {/* Mobile Users List Drawer */}
      {isMobile && (
        <Drawer
          anchor="left"
          open={showUsersList}
          onClose={() => {
            console.log("Closing mobile drawer");
            setShowUsersList(false);
          }}
          sx={{
            "& .MuiDrawer-paper": {
              width: "100%",
              maxWidth: 400,
              height: "100%",
              bgcolor: theme.palette.background.default,
              overflow: "hidden",
            },
          }}
        >
          <Box
            sx={{
              height: "100%",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
            }}
          >
            <Box
              sx={{
                p: 2,
                borderBottom: "1px solid",
                borderColor: "divider",
                flexShrink: 0,
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Typography variant="h6">Messages</Typography>
                <IconButton onClick={() => setShowUsersList(false)}>
                  <MenuOutlined />
                </IconButton>
              </Box>
            </Box>
            <Box sx={{ p: 1, flexShrink: 0 }}>
              <TextField
                fullWidth
                size="small"
                placeholder="Search messages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <SearchOutlined style={{ marginRight: 8, color: "gray" }} />
                  ),
                }}
              />
            </Box>
            <List sx={{ flexGrow: 1, overflow: "auto", minHeight: 0 }}>
              {filteredConversations.length === 0 ? (
                <ListItem>
                  <ListItemText
                    primary="No conversations found"
                    secondary={
                      conversations.length === 0
                        ? "Loading conversations..."
                        : "Try adjusting your search"
                    }
                    sx={{ textAlign: "center" }}
                  />
                </ListItem>
              ) : (
                filteredConversations.map((conv) => (
                  <ListItem
                    key={conv.id}
                    button
                    selected={selectedUser?.id === conv.id}
                    onClick={() => handleUserSelect(conv)}
                    sx={{
                      "&:hover": {
                        bgcolor: theme.palette.action.hover,
                      },
                    }}
                  >
                    <ListItemAvatar>
                      <Avatar>{conv.participant.firstName[0]}</Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={`${conv.participant.firstName} ${conv.participant.lastName}`}
                      secondary={
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {conv.last_message || "No messages yet"}
                        </Typography>
                      }
                    />
                    <Typography variant="caption" color="text.secondary">
                      {conv.last_message_time || "Just now"}
                    </Typography>
                  </ListItem>
                ))
              )}
            </List>
          </Box>
        </Drawer>
      )}
    </Box>
  );
}

export default Chat;
