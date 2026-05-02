import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { supabase } from "@/lib/supabaseProxy";
import { toast } from "sonner";
import { Loader2, Plus, Pencil, Trash2, GraduationCap } from "lucide-react";
import { AdminSidebar } from "@/components/AdminSidebar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { useQueryClient } from "@tanstack/react-query";

interface Standard {
  id: string;
  value: string;
  label: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
}

export default function StandardManagement() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [standards, setStandards] = useState<Standard[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState<Standard | null>(null);
  const [deleting, setDeleting] = useState<Standard | null>(null);

  const [formData, setFormData] = useState({
    value: "",
    label: "",
    display_order: 0,
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
        fetchStandards();
      } catch (error) {
        console.error("Auth check failed:", error);
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  const fetchStandards = async () => {
    try {
      const { data, error } = await supabase
        .from("standards")
        .select("*")
        .order("display_order", { ascending: true });
      if (error) throw error;
      setStandards((data as Standard[]) || []);
    } catch (error) {
      console.error("Error fetching standards:", error);
      toast.error("Failed to load standards");
    } finally {
      setLoading(false);
    }
  };

  const sync = async () => {
    await Promise.all([
      fetchStandards(),
      queryClient.invalidateQueries({ queryKey: ["standards"] }),
    ]);
  };

  const openAdd = () => {
    setEditing(null);
    setFormData({ value: "", label: "", display_order: standards.length + 1, is_active: true });
    setDialogOpen(true);
  };

  const openEdit = (s: Standard) => {
    setEditing(s);
    setFormData({
      value: s.value,
      label: s.label,
      display_order: s.display_order,
      is_active: s.is_active,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.value.trim() || !formData.label.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }
    setSaving(true);
    try {
      if (editing) {
        const { error } = await supabase
          .from("standards")
          .update({
            value: formData.value.trim(),
            label: formData.label.trim(),
            display_order: formData.display_order,
            is_active: formData.is_active,
          })
          .eq("id", editing.id);
        if (error) throw error;
        toast.success("Standard updated");
      } else {
        const { error } = await supabase
          .from("standards")
          .insert({
            value: formData.value.trim(),
            label: formData.label.trim(),
            display_order: formData.display_order,
            is_active: formData.is_active,
          });
        if (error) throw error;
        toast.success("Standard added");
      }
      setDialogOpen(false);
      await sync();
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleting) return;
    setSaving(true);
    try {
      const { error } = await supabase.from("standards").delete().eq("id", deleting.id);
      if (error) throw error;
      toast.success("Standard deleted");
      setDeleteDialogOpen(false);
      setDeleting(null);
      await sync();
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Failed to delete");
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (s: Standard) => {
    try {
      const { error } = await supabase
        .from("standards")
        .update({ is_active: !s.is_active })
        .eq("id", s.id);
      if (error) throw error;
      toast.success(`Standard ${!s.is_active ? "enabled" : "disabled"}`);
      await sync();
    } catch (error) {
      console.error(error);
      toast.error("Failed to update");
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
                <h1 className="text-3xl font-bold">Standard Management</h1>
                <p className="text-muted-foreground">
                  Add, edit, enable/disable, or remove standards shown in the registration form
                </p>
              </div>
              <Button onClick={openAdd} className="gap-2">
                <Plus className="h-4 w-4" />
                Add Standard
              </Button>
            </div>

            <div className="grid gap-4">
              {standards.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <GraduationCap className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No standards configured yet.</p>
                    <Button onClick={openAdd} variant="outline" className="mt-4 gap-2">
                      <Plus className="h-4 w-4" />
                      Add First Standard
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                standards.map((s) => (
                  <Card key={s.id} className={!s.is_active ? "opacity-60" : ""}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <div>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <GraduationCap className="h-5 w-5 text-primary" />
                          {s.label}
                        </CardTitle>
                        <CardDescription>
                          Value: {s.value} • Order: {s.display_order}
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-2 mr-4">
                          <Label className="text-sm">{s.is_active ? "Active" : "Inactive"}</Label>
                          <Switch checked={s.is_active} onCheckedChange={() => toggleActive(s)} />
                        </div>
                        <Button variant="outline" size="icon" onClick={() => openEdit(s)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                          onClick={() => {
                            setDeleting(s);
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

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editing ? "Edit Standard" : "Add Standard"}</DialogTitle>
                <DialogDescription>
                  {editing ? "Update the standard details." : "Add a new standard to the registration form."}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="value">Value * (stored in database, e.g. 5)</Label>
                  <Input
                    id="value"
                    placeholder="e.g., 5"
                    value={formData.value}
                    onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="label">Display Label *</Label>
                  <Input
                    id="label"
                    placeholder="e.g., Standard 5"
                    value={formData.label}
                    onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="order">Display Order</Label>
                  <Input
                    id="order"
                    type="number"
                    value={formData.display_order}
                    onChange={(e) =>
                      setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })
                    }
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
                  {editing ? "Update" : "Add"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete Standard</DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete "{deleting?.label}"? This cannot be undone.
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
