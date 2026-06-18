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
      <DialogContent className="max-w-[400px] bg-white border border-[#E0DDD7] rounded-[16px] p-6 text-[#1A1814]">
        <DialogHeader>
          <DialogTitle className="font-['Syne'] text-[17px] font-bold text-[#1A1814]">Input Insentif Manual</DialogTitle>
          <DialogDescription className="text-[12.5px] text-[#6B6760] mt-1.5">
            Masukkan nominal bonus atau insentif tambahan untuk karyawan di bulan {selectedPeriodLabel}.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <label className="text-[12.5px] text-[#6B6760] font-medium block mb-1.5">Nominal Insentif (Rp)</label>
          <div className="relative">
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[13px] font-mono text-[#6B6760]">Rp</div>
            <Input 
              type="number"
              placeholder="Contoh: 500000" 
              value={incentiveAmount}
              onChange={e => setIncentiveAmount(e.target.value)}
              className="pl-9 bg-white border-[#E0DDD7] rounded-[10px] text-[13.5px] h-[40px] focus-visible:ring-0 focus-visible:border-[#CBC8C2] font-mono"
            />
          </div>
        </div>
        <DialogFooter className="flex gap-2 justify-end mt-4">
          <Button 
            onClick={() => setShowIncentiveModal(false)} 
            variant="outline" 
            className="bg-white border-[#E0DDD7] hover:border-[#CBC8C2] text-[#6B6760] hover:text-[#1A1814] h-[36px] text-[12.5px] rounded-[10px]"
          >
            Batal
          </Button>
          <Button 
            onClick={handleSaveIncentive} 
            disabled={updateIncentiveMutation.isPending}
            className="bg-[#C84B2F] hover:bg-[#b03d24] text-white border-none h-[36px] text-[12.5px] rounded-[10px]"
          >
            {updateIncentiveMutation.isPending && <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />}
            Simpan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
