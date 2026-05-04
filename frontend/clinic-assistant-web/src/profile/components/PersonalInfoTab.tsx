import { useEffect, useState } from "react";
import { Box, Button, CircularProgress, Snackbar, TextField } from "@mui/material";
import useAuth from "@/auth/useAuth";
import useProfileApi from "@/profile/useProfileApi";
import useDoctorApi from "@/doctors/useDoctorApi";
import usePatientApi from "@/patients/usePatientApi";
import ErrorBanner from "@/shared/components/ErrorBanner";
import { extractErrorMessages } from "@/core/errorMessages";
import { Roles, SexLabels } from "@/shared/types/enums";

const PersonalInfoTab = () => {
  const { user, hasRole, refreshToken } = useAuth();
  const { updateProfile } = useProfileApi();
  const { getDoctorById } = useDoctorApi();
  const { getPatientById } = usePatientApi();

  const [firstName, setFirstName] = useState(user?.firstName ?? "");
  const [lastName, setLastName] = useState(user?.lastName ?? "");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [initialPhoneNumber, setInitialPhoneNumber] = useState("");

  const [readOnlyFields, setReadOnlyFields] = useState<Record<string, string>>({});

  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [errors, setErrors] = useState<string[]>([]);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!user) {
      return;
    }

    const fetchProfile = async () => {
      setFetchLoading(true);
      try {
        if (hasRole(Roles.Doctor)) {
          const doctor = await getDoctorById(user.id);
          setPhoneNumber(doctor.phoneNumber ?? "");
          setInitialPhoneNumber(doctor.phoneNumber ?? "");
          setReadOnlyFields({
            Specialization: doctor.specialization,
            "Cod Parafă": doctor.codParafa,
          });
        } else if (hasRole(Roles.Patient)) {
          const patient = await getPatientById(user.id);
          setPhoneNumber(patient.phoneNumber ?? "");
          setInitialPhoneNumber(patient.phoneNumber ?? "");
          const birthDate = new Date(patient.birthDate).toLocaleDateString("ro-RO");
          setReadOnlyFields({
            CNP: patient.identityNumber,
            Adresă: patient.address,
            "Data nașterii": birthDate,
            Sex: SexLabels[patient.sex],
          });
        }
      } catch {
        // read-only fields rămân goale dacă fetch-ul eșuează
      } finally {
        setFetchLoading(false);
      }
    };

    fetchProfile();
  }, [user, hasRole, getDoctorById, getPatientById]);

  const isDirty =
    firstName !== (user?.firstName ?? "") ||
    lastName !== (user?.lastName ?? "") ||
    phoneNumber !== initialPhoneNumber;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors([]);
    setLoading(true);
    try {
      const response = await updateProfile({
        firstName,
        lastName,
        phoneNumber: phoneNumber || null,
      });
      refreshToken(response.token);
      setInitialPhoneNumber(phoneNumber);
      setSuccess(true);
    } catch (err) {
      setErrors(extractErrorMessages(err));
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column", gap: 2, maxWidth: 480 }}>
        <ErrorBanner messages={errors} />
        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
          <TextField
            label="Prenume"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
            fullWidth
          />
          <TextField
            label="Nume"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
            fullWidth
          />
        </Box>
        <TextField
          label="Email"
          value={user?.email ?? ""}
          disabled
          fullWidth
        />
        <TextField
          label="Telefon"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          fullWidth
        />
        {Object.entries(readOnlyFields).map(([label, value]) => (
          <TextField key={label} label={label} value={value} disabled fullWidth />
        ))}
        {!hasRole(Roles.Admin) && (
          <Box>
            <Button type="submit" variant="contained" disabled={loading || !isDirty}>
              {loading ? <CircularProgress size={22} color="inherit" /> : "Salvează"}
            </Button>
          </Box>
        )}
      </Box>
      <Snackbar
        open={success}
        autoHideDuration={4000}
        onClose={() => setSuccess(false)}
        message="Datele au fost actualizate."
      />
    </>
  );
};

export default PersonalInfoTab;
