-- Create trigger to auto-generate registration numbers on insert/update
DROP TRIGGER IF EXISTS generate_registration_number_trigger ON registrations;

CREATE TRIGGER generate_registration_number_trigger
  BEFORE INSERT OR UPDATE ON registrations
  FOR EACH ROW
  EXECUTE FUNCTION generate_seat_number();