import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Typography,
  List,
  ListItem,
  ListItemText,
  Paper,
  CircularProgress,
} from "@mui/material";
import CreateJobModal from "../components/CreateJobModal";
import { useUser } from "../contexts/UserContext";
import axios from "axios";
import JobCard from "../components/JobCard";

const MyJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const { user, devMode } = useUser();

  const fetchJobsFromDatabase = async () => {
    try {
      const endpoint = devMode
        ? `/api/projects/otherjobs/${user.id}`
        : `/api/projects/myjobs/${user.id}`;

      const res = await axios.get(endpoint);

      if (res.data.ok) {
        return res.data.jobs || [];
      }
    } catch (err) {
      console.error("Failed to fetch jobs", err);
      return [];
    }
  };

  useEffect(() => {
    const loadJobs = async () => {
      setLoading(true);
      const data = await fetchJobsFromDatabase();
      console.log(data, "fgsufhuiefyi");
      setJobs(data);
      setLoading(false);
    };

    if (user?.id) {
      loadJobs();
    }
  }, [devMode, user?.id]);

  const handleJobCreated = (newJob) => {
    setJobs((prev) => [newJob, ...prev]);
  };

  const hasJobs = jobs.length > 0;

  const getStatusColor = (status) => {
    const normalized = status?.toLowerCase();
    console.log(normalized, "FNIWBFIEY");

    switch (normalized) {
      case "bidding":
        return "#2196F3"; // Blue
      case "in_progress":
        return "#FF9800"; // Orange
      case "awaiting_client_approval":
      case "awaiting_developer_approval":
        return "#FFC107"; // Amber
      case "completed":
        return "#4CAF50"; // Green
      case "cancelled":
        return "#F44336"; // Red
      default:
        return "#9E9E9E"; // Grey fallback
    }
  };

  return (
    <>
      <Box
        sx={{
          p: 4,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        {loading ? (
          <CircularProgress />
        ) : !hasJobs ? (
          <Box sx={{ textAlign: "center", mt: 10 }}>
            <Typography variant="h6" gutterBottom>
              {devMode
                ? "No jobs are currently available for bidding."
                : "You don't have any active jobs yet."}
            </Typography>
            {!devMode && (
              <Button
                variant="contained"
                color="primary"
                onClick={() => setModalOpen(true)}
              >
                Create My First Job
              </Button>
            )}
          </Box>
        ) : (
          <Box sx={{ width: "100%", maxWidth: 600 }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                mb: 2,
              }}
            >
              <Typography variant="h5">
                {devMode ? "Available Jobs" : "My Jobs"}
              </Typography>
              {!devMode && (
                <Button variant="contained" onClick={() => setModalOpen(true)}>
                  New Job
                </Button>
              )}
            </Box>
            <List>
              {jobs.map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                  onJobUpdated={(updatedJob) => {
                    setJobs((prevJobs) =>
                      prevJobs.map((j) =>
                        j.id === updatedJob.id ? updatedJob : j
                      )
                    );
                  }}
                />
              ))}
            </List>
          </Box>
        )}
      </Box>

      <CreateJobModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onJobCreated={handleJobCreated}
        user={user}
      />
    </>
  );
};

export default MyJobs;
