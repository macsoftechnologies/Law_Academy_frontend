import Swal from "sweetalert2";

export const showSuccess = (message = "Success") => {
  Swal.fire({
    title: "Success!",
    text: message,
    icon: "success",
    toast: true,
    position: "top-end",
    timer: 6000,
    showConfirmButton: false,
    timerProgressBar: true,
    background: "#28a745",
    color: "#ffffff",
  });
};

export const showError = (message = "Something went wrong") => {
  Swal.fire({
    title: "Error",
    text: message,
    icon: "error",
  });
};

export const showDeleteConfirm = async () => {
  return await Swal.fire({
    title: "Are you sure?",
    text: "This record will be deleted permanently!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Yes, delete",
    cancelButtonText: "Cancel",
    confirmButtonColor: "#8f1e1e",
    cancelButtonColor: "#6c757d",
  });
};

export const showDeleteSuccess = () => {
  Swal.fire({
    title: "Deleted!",
    text: "Deleted successfully",
    icon: "success",
    toast: true,
    position: "top-end",
    timer: 5000,
    showConfirmButton: false,
    background: "#8f1e1e",
    color: "#ffffff",
  });
};