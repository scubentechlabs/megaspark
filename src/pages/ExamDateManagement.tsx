import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Plus, Pencil, Trash2, Calendar } from "lucide-react";
import { AdminSidebar } from "@/components/AdminSidebar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { format } from "date-fns";

interface ExamDate {
  id: string;
  exam_date: string;
  label: string;
  day_name: string | null;
  exam_time: string | null;
  is_active: boolean;
  created_at: string;
}

export default function ExamDateManagement() {
  const navigate = useNavigate();
  const [examDates, setExamDates] = useState<ExamDate[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingDate, setEditingDate] = useState<ExamDate | null>(null);
  const [deletingDate, setDeletingDate] = useState<ExamDate | null>(null);

  const [formData, setFormData] = useState({
    exam_date: "",
    label: "",
    day_name: "",
    exam_time: "8:00 AM - 11:00 AM",
    is_active: true,
  });

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          navigate("/admin/login");
          return;
        }
        fetchExamDates();
      } catch (error) {
        console.error("Auth check failed:", error);
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  const fetchExamDates = async () => {
    try {
      const { data, error } = await supabase
        .from("exam_dates")
        .select("*")
        .order("exam_date", { ascending: true });

      if (error) throw error;
      setExamDates((data as ExamDate[]) || []);
    } catch (error) {
      console.error("Error fetching exam dates:", error);
      toast.error("Failed to load exam dates");
    } finally {
      setLoading(false);
    }
  };

  const openAddDialog = () => {
    setEditingDate(null);
    setFormData({
      exam_date: "",
      label: "",
      day_name: "",
      exam_time: "8:00 AM - 11:00 AM",
      is_active: true,
    });
    setDialogOpen(true);
  };

  const openEditDialog = (examDate: ExamDate) => {
    setEditingDate(examDate);
    setFormData({
      exam_date: examDate.exam_date,
      label: examDate.label,
      day_name: examDate.day_name || "",
      exam_time: examDate.exam_time || "8:00 AM - 11:00 AM",
      is_active: examDate.is_active,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.exam_date || !formData.label) {
      toast.error("Please fill in all required fields");
      return;
    }

    setSaving(true);
    try {
      if (editingDate) {
        const { error } = await supabase
          .from("exam_dates")
          .update({
            exam_date: formData.exam_date,
            label: formData.label,
            day_name: formData.day_name || null,
            exam_time: formData.exam_time || null,
            is_active: formData.is_active,
          })
          .eq("id", editingDate.id);

        if (error) throw error;
        toast.success("Exam date updated successfully");
      } else {
        const { error } = await supabase
          .from("exam_dates")
          .insert({
            exam_date: formData.exam_date,
            label: formData.label,
            day_name: formData.day_name || null,
            exam_time: formData.exam_time || null,
            is_active: formData.is_active,
          });

        if (error) throw error;
        toast.success("Exam date added successfully");
      }

      setDialogOpen(false);
      fetchExamDates();
    } catch (error: any) {
      console.error("Error saving exam date:", error);
      toast.error(error.message || "Failed to save exam date");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingDate) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from("exam_dates")
        .delete()
        .eq("id", deletingDate.id);

      if (error) throw error;
      toast.success("Exam date deleted successfully");
      setDeleteDialogOpen(false);
      setDeletingDate(null);
      fetchExamDates();
    } catch (error: any) {
      console.error("Error deleting exam date:", error);
      toast.error(error.message || "Failed to delete exam date");
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (examDate: ExamDate) => {
    try {
      const { error } = await supabase
        .from("exam_dates")
        .update({ is_active: !examDate.is_active })
        .eq("id", examDate.id);

      if (error) throw error;
      toast.success(`Exam date ${!examDate.is_active ? "enabled" : "disabled"}`);
      fetchExamDates();
    } catch (error) {
      console.error("Error toggling exam date:", error);
      toast.error("Failed to update exam date");
    }
  };

  if (loading) {
    return (
      <SidebarProvider defaultOpen={false}>
        <div className="flex min-h-screen w-full">
          <AdminSidebar />
          <SidebarInset>
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider defaultOpen={false}>
      <div className="flex min-h-screen w-full">
        <AdminSidebar />
        <SidebarInset>
          <div className="container mx-auto p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold">Exam Date Management</h1>
                <p className="text-muted-foreground">Add, edit, or remove exam dates</p>
              </div>
              <Button onClick={openAddDialog} className="gap-2">
                <Plus className="h-4 w-4" />
                Add Exam Date
              </Button>
            </div>

            <div className="grid gap-4">
              {examDates.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No exam dates configured yet.</p>
                    <Button onClick={openAddDialog} variant="outline" className="mt-4 gap-2">
                      <Plus className="h-4 w-4" />
                      Add First Exam Date
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                examDates.map((examDate) => (
                  <Card key={examDate.id} className={!examDate.is_active ? "opacity-60" : ""}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <div>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Calendar className="h-5 w-5 text-primary" />
                          {examDate.label}
                        </CardTitle>
                        <CardDescription>
                          {format(new Date(examDate.exam_date), "yyyy-MM-dd")}
                          {examDate.day_name && ` • ${examDate.day_name}`}
                          {examDate.exam_time && ` • ${examDate.exam_time}`}
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-2 mr-4">
                          <Label className="text-sm">
                            {examDate.is_active ? "Active" : "Inactive"}
                          </Label>
                          <Switch
                            checked={examDate.is_active}
                            onCheckedChange={() => toggleActive(examDate)}
                          />
                        </div>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => openEditDialog(examDate)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                          onClick={() => {
                            setDeletingDate(examDate);
                            setDeleteDialogOpen(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>
                  </Card>
                ))
              )}
            </div>
          </div>

          {/* Add/Edit Dialog */}
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingDate ? "Edit Exam Date" : "Add Exam Date"}</DialogTitle>
                <DialogDescription>
                  {editingDate ? "Update the exam date details below." : "Fill in the details to add a new exam date."}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="exam_date">Exam Date *</Label>
                  <Input
                    id="exam_date"
                    type="date"
                    value={formData.exam_date}
                    onChange={(e) => setFormData({ ...formData, exam_date: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="label">Display Label *</Label>
                  <Input
                    id="label"
                    placeholder="e.g., 30th November 2025"
                    value={formData.label}
                    onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="day_name">Day Name</Label>
                  <Input
                    id="day_name"
                    placeholder="e.g., Sunday"
                    value={formData.day_name}
                    onChange={(e) => setFormData({ ...formData, day_name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="exam_time">Exam Time</Label>
                  <Input
                    id="exam_time"
                    placeholder="e.g., 8:00 AM - 11:00 AM"
                    value={formData.exam_time}
                    onChange={(e) => setFormData({ ...formData, exam_time: e.target.value })}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                  />
                  <Label>Active</Label>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={saving}>
                  {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  {editingDate ? "Update" : "Add"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Delete Confirmation Dialog */}
          <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete Exam Date</DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete "{deletingDate?.label}"? This action cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                  Cancel
                </Button>
                <Button variant="destructive" onClick={handleDelete} disabled={saving}>
                  {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Delete
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
