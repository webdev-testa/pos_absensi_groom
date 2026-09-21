import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface IncentiveDialogProps {
  showIncentiveModal: boolean;
  setShowIncentiveModal: (show: boolean) => void;
  selectedPeriodLabel: string;
  incentiveAmount: string;
  setIncentiveAmount: (amount: string) => void;
  handleSaveIncentive: () => void;
  updateIncentiveMutation: {
    isPending: boolean;
  };
}

export function IncentiveDialog({
  showIncentiveModal,
  setShowIncentiveModal,
  selectedPeriodLabel,
  incentiveAmount,
  setIncentiveAmount,
  handleSaveIncentive,
  updateIncentiveMutation,
}: IncentiveDialogProps) {
  return (
    <Dialog open={showIncentiveModal} onOpenChange={setShowIncentiveModal}>
      <DialogContent className="sm:max-w-[400px] max-w-[calc(100%-2rem)] bg-card border border-border rounded-2xl p-6 text-foreground shadow-xl">
        <DialogHeader>
          <DialogTitle className="font-heading text-base font-bold text-foreground">Input Insentif Manual</DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground mt-1">
            Masukkan nominal bonus atau insentif tambahan untuk karyawan di bulan {selectedPeriodLabel}.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <label htmlFor="incentive-amount" className="text-xs text-muted-foreground font-medium block mb-1.5">Nominal Insentif (Rp) *</label>
          <div className="relative">
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-mono text-muted-foreground font-semibold">Rp</div>
            <Input 
              id="incentive-amount"
              type="text"
              inputMode="numeric"
              placeholder="Contoh: 500.000" 
              value={incentiveAmount}
              onChange={e => {
                const rawVal = e.target.value.replace(/\D/g, '');
                const formatted = rawVal.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
                setIncentiveAmount(formatted);
              }}
              className="pl-9 bg-background border-border rounded-xl text-xs sm:text-sm h-10 font-mono"
            />
          </div>
        </div>
        <DialogFooter className="flex gap-2 justify-end mt-2 bg-transparent border-none">
          <Button 
            onClick={() => setShowIncentiveModal(false)} 
            variant="ghost" 
            className="text-muted-foreground hover:text-foreground h-9 text-xs rounded-xl"
          >
            Batal
          </Button>
          <Button 
            onClick={handleSaveIncentive} 
            disabled={updateIncentiveMutation.isPending}
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold h-9 text-xs rounded-xl"
          >
            {updateIncentiveMutation.isPending && <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin motion-reduce:animate-none" />}
            Simpan Insentif
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
