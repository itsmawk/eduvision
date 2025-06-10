import React, { useEffect, useState } from "react";
import axios from "axios";
import AdminMain from "./AdminMain";
import Swal from "sweetalert2";
import {
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Avatar,
  CircularProgress,
  Dialog,
  DialogContent,
  IconButton,
  DialogTitle,
  Button,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { ArrowBackIos, ArrowForwardIos } from "@mui/icons-material";

interface Faculty {
  _id: string;
  email: string;
  role: string;
  department: { name: string } | string;
  program?: { name: string } | string;
  profilePhoto: string;
  dateSignedUp?: string;
}

const PendingFaculty: React.FC = () => {
  const CourseName = localStorage.getItem("course") ?? "";
  const CollegeName = localStorage.getItem("college") ?? "";

  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [hoveredBtn, setHoveredBtn] = useState<string | null>(null);

  const [facultyList, setFacultyList] = useState<Faculty[]>([]);
  const [loading, setLoading] = useState(true);

  // Pagination state
  const [page, setPage] = useState(1);
  const rowsPerPage = 10;

  useEffect(() => {
    const fetchFaculty = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/auth/initial-faculty", {
          params: { courseName: CourseName },
        });
        setFacultyList(response.data);
      } catch (error) {
        console.error("Error fetching faculty list:", error);
      } finally {
        setLoading(false);
      }
    };

    if (CourseName) {
      fetchFaculty();
    } else {
      setLoading(false);
    }
  }, [CourseName]);

  const handleAccept = async (facultyId: string) => {
    const confirm = await Swal.fire({
      title: "Are you sure?",
      text: "You are about to accept this faculty member.",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, accept",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#4CAF50",
      cancelButtonColor: "#f44336",
    });

    if (confirm.isConfirmed) {
      try {
        Swal.fire({
          title: "Processing...",
          text: "Accepting faculty member...",
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          },
        });

        const response = await axios.put(`http://localhost:5000/api/auth/approve-faculty/${facultyId}`);
        console.log(response.data);

        Swal.fire({
          title: "Approved!",
          text: "Faculty has been accepted successfully.",
          icon: "success",
          confirmButtonColor: "#4CAF50",
        });

        setFacultyList((prev) => prev.filter((f) => f._id !== facultyId));

        const maxPage = Math.ceil((facultyList.length - 1) / rowsPerPage);
        if (page > maxPage) setPage(maxPage > 0 ? maxPage : 1);

      } catch (error) {
        console.error("Error approving faculty:", error);
        Swal.fire({
          title: "Error",
          text: "Failed to approve faculty. Please try again.",
          icon: "error",
          confirmButtonColor: "#f44336",
        });
      }
    }
  };

  const handleReject = async (facultyId: string) => {
    const confirm = await Swal.fire({
      title: "Are you sure?",
      text: "You are about to reject this faculty member.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, reject",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#f44336",
      cancelButtonColor: "#9e9e9e",
    });

    if (confirm.isConfirmed) {
      try {
        Swal.fire({
          title: "Processing...",
          text: "Rejecting faculty member...",
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          },
        });

        const response = await axios.put(`http://localhost:5000/api/auth/reject-faculty/${facultyId}`);
        console.log(response.data);
        
        Swal.fire({
          title: "Rejected!",
          text: "Faculty has been rejected successfully.",
          icon: "success",
          confirmButtonColor: "#f44336",
        });

        setFacultyList((prev) => prev.filter((f) => f._id !== facultyId));

        const maxPage = Math.ceil((facultyList.length - 1) / rowsPerPage);
        if (page > maxPage) setPage(maxPage > 0 ? maxPage : 1);

      } catch (error) {
        console.error("Error rejecting faculty:", error);
        Swal.fire({
          title: "Error",
          text: "Failed to reject faculty. Please try again.",
          icon: "error",
          confirmButtonColor: "#f44336",
        });
      }
    }
  };

  const startIndex = (page - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const paginatedFacultyList = facultyList.slice(startIndex, endIndex);

  const totalPages = Math.ceil(facultyList.length / rowsPerPage);

  const handlePrevPage = () => {
    setPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setPage((prev) => Math.min(prev + 1, totalPages));
  };

  return (
    <AdminMain>
      <Box>
        <Typography variant="h4" fontWeight="bold" color="#333" gutterBottom>
          Pending Faculty {CourseName && `- ${CourseName.toUpperCase()}`}
        </Typography>
        <Typography variant="body2" color="text.secondary" mb={2}>
          <span style={{ fontWeight: 400 }}>
            List of faculty members whose registration or approval is still pending.
          </span>
        </Typography>

        {loading ? (
          <CircularProgress />
        ) : (
          <>
            <TableContainer component={Paper} elevation={3}>
                <Box sx={{ maxHeight: 500, overflow: "auto" }}>
                    <Table>
                        <TableHead sx={{ backgroundColor: "#f5f5f5" }}>
                        <TableRow>
                            <TableCell sx={{ position: "sticky", top: 0, backgroundColor: "#f5f5f5", zIndex: 1 }}>Profile</TableCell>
                            <TableCell sx={{ position: "sticky", top: 0, backgroundColor: "#f5f5f5", zIndex: 1 }}>Email</TableCell>
                            <TableCell sx={{ position: "sticky", top: 0, backgroundColor: "#f5f5f5", zIndex: 1 }}>Role</TableCell>
                            <TableCell sx={{ position: "sticky", top: 0, backgroundColor: "#f5f5f5", zIndex: 1 }}>Department</TableCell>
                            <TableCell sx={{ position: "sticky", top: 0, backgroundColor: "#f5f5f5", zIndex: 1 }}>Program</TableCell>
                            <TableCell sx={{ position: "sticky", top: 0, backgroundColor: "#f5f5f5", zIndex: 1 }}>Date Signed Up</TableCell>
                            <TableCell
                                align="center"
                                sx={{ position: "sticky", top: 0, backgroundColor: "#f5f5f5", zIndex: 1 }}
                                >
                                Actions
                                </TableCell>
                        </TableRow>
                        </TableHead>
                        <TableBody>
                        {facultyList.length === 0 ? (
                            <TableRow>
                            <TableCell colSpan={7} align="center">
                                No account pending for approval at the moment.
                            </TableCell>
                            </TableRow>
                        ) : (
                            paginatedFacultyList.map((faculty) => (
                            <TableRow key={faculty._id}>
                                <TableCell>
                                <Avatar
                                    src={faculty.profilePhoto}
                                    alt={faculty.email}
                                    sx={{ cursor: "pointer" }}
                                    onClick={() => {
                                    setPreviewImage(faculty.profilePhoto);
                                    setPreviewOpen(true);
                                    }}
                                />
                                </TableCell>
                                <TableCell>{faculty.email}</TableCell>
                                <TableCell>{faculty.role}</TableCell>
                                <TableCell>
                                {typeof faculty.department === "string"
                                    ? faculty.department
                                    : faculty.department?.name ?? "N/A"}
                                </TableCell>
                                <TableCell>
                                {typeof faculty.program === "string"
                                    ? faculty.program
                                    : faculty.program?.name ?? "N/A"}
                                </TableCell>
                                <TableCell>
                                {faculty.dateSignedUp
                                    ? new Date(faculty.dateSignedUp).toLocaleDateString("en-US", {
                                        year: "numeric",
                                        month: "long",
                                        day: "numeric",
                                    })
                                    : "N/A"}
                                </TableCell>
                                <TableCell align="center">
                                <Box display="flex" justifyContent="center" gap={1}>
                                    <button
                                    style={{
                                        backgroundColor:
                                        hoveredBtn === `accept-${faculty._id}` ? "#45a049" : "#4CAF50",
                                        color: "white",
                                        border: "none",
                                        borderRadius: "4px",
                                        padding: "6px 12px",
                                        cursor: "pointer",
                                        fontWeight: "bold",
                                        transition: "background-color 0.2s ease",
                                    }}
                                    onMouseEnter={() => setHoveredBtn(`accept-${faculty._id}`)}
                                    onMouseLeave={() => setHoveredBtn(null)}
                                    onClick={() => handleAccept(faculty._id)}
                                    >
                                    Accept
                                    </button>

                                    <button
                                    style={{
                                        backgroundColor:
                                        hoveredBtn === `reject-${faculty._id}` ? "#d32f2f" : "#f44336",
                                        color: "white",
                                        border: "none",
                                        borderRadius: "4px",
                                        padding: "6px 12px",
                                        cursor: "pointer",
                                        fontWeight: "bold",
                                        transition: "background-color 0.2s ease",
                                    }}
                                    onMouseEnter={() => setHoveredBtn(`reject-${faculty._id}`)}
                                    onMouseLeave={() => setHoveredBtn(null)}
                                    onClick={() => handleReject(faculty._id)}
                                    >
                                    Reject
                                    </button>
                                </Box>
                                </TableCell>
                            </TableRow>
                            ))
                        )}
                        </TableBody>
                    </Table>
                </Box>
            </TableContainer>

            {/* Pagination Controls */}
            {facultyList.length > rowsPerPage && (
              <Box
                mt={2}
                display="flex"
                justifyContent="center"
                alignItems="center"
                gap={2}
              >
                <Button
                  variant="outlined"
                  startIcon={<ArrowBackIos />}
                  onClick={handlePrevPage}
                  disabled={page === 1}
                >
                  Previous
                </Button>

                <Typography variant="body2">
                  Page {page} of {totalPages}
                </Typography>

                <Button
                  variant="outlined"
                  endIcon={<ArrowForwardIos />}
                  onClick={handleNextPage}
                  disabled={page === totalPages}
                >
                  Next
                </Button>
              </Box>
            )}

            {/* Image Preview Dialog */}
            <Dialog
              open={previewOpen}
              onClose={() => setPreviewOpen(false)}
              maxWidth="sm"
              fullWidth
            >
              <DialogTitle sx={{ m: 0, p: 2 }}>
                Profile Photo
                <IconButton
                  aria-label="close"
                  onClick={() => setPreviewOpen(false)}
                  sx={{
                    position: "absolute",
                    right: 8,
                    top: 8,
                    color: (theme) => theme.palette.grey[500],
                  }}
                >
                  <CloseIcon />
                </IconButton>
              </DialogTitle>
              <DialogContent
                dividers
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  padding: 0,
                }}
              >
                <img
                  src={previewImage ?? undefined}
                  alt="Preview"
                  style={{ width: "100%", height: "auto", objectFit: "contain" }}
                />
              </DialogContent>
            </Dialog>
          </>
        )}
      </Box>
    </AdminMain>
  );
};

export default PendingFaculty;
