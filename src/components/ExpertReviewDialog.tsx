import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { UserCheck, Calendar as CalendarIcon, MessageSquare, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface ExpertReviewDialogProps {
  businessId?: string;
  analysisId?: string;
  insightCategory?: string;
  trigger?: React.ReactNode;
}

export function ExpertReviewDialog({ businessId, analysisId, insightCategory, trigger }: ExpertReviewDialogProps) {
  const [open, setOpen] = useState(false);
  const [requestType, setRequestType] = useState<'full_review' | 'insight_clarification' | 'consultation_booking'>('full_review');
  const [insightQuestion, setInsightQuestion] = useState('');
  const [consultationTopic, setConsultationTopic] = useState('');
  const [consultationDate, setConsultationDate] = useState<Date>();
  const [consultationTime, setConsultationTime] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Authentication required",
          description: "Please sign in to request expert review",
          variant: "destructive"
        });
        return;
      }

      const requestData: any = {
        user_id: user.id,
        business_id: businessId,
        analysis_id: analysisId,
        request_type: requestType,
        priority,
      };

      if (requestType === 'insight_clarification') {
        if (!insightQuestion.trim()) {
          toast({
            title: "Question required",
            description: "Please enter your question about the insight",
            variant: "destructive"
          });
          setLoading(false);
          return;
        }
        requestData.insight_category = insightCategory || 'General';
        requestData.insight_question = insightQuestion;
      }

      if (requestType === 'consultation_booking') {
        if (!consultationDate || !consultationTime || !consultationTopic.trim()) {
          toast({
            title: "Booking details required",
            description: "Please provide date, time, and topic for the consultation",
            variant: "destructive"
          });
          setLoading(false);
          return;
        }
        requestData.preferred_date = format(consultationDate, 'yyyy-MM-dd');
        requestData.preferred_time = consultationTime;
        requestData.consultation_topic = consultationTopic;
      }

      const { error } = await supabase
        .from('expert_review_requests')
        .insert(requestData);

      if (error) throw error;

      toast({
        title: "Request submitted successfully",
        description: requestType === 'consultation_booking' 
          ? "Our team will contact you to confirm your consultation slot"
          : "Our expert team will review your request and respond within 2-3 business days",
      });

      setOpen(false);
      // Reset form
      setInsightQuestion('');
      setConsultationTopic('');
      setConsultationDate(undefined);
      setConsultationTime('');
      setPriority('medium');
      setRequestType('full_review');
    } catch (error: any) {
      console.error('Error submitting review request:', error);
      toast({
        title: "Error submitting request",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" className="gap-2">
            <UserCheck className="h-4 w-4" />
            Request Expert Review
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserCheck className="h-5 w-5" />
            Request Expert Review
          </DialogTitle>
          <DialogDescription>
            Get human expert validation and guidance on your analysis results
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Review Type</Label>
            <RadioGroup value={requestType} onValueChange={(value: any) => setRequestType(value)}>
              <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted/50 cursor-pointer">
                <RadioGroupItem value="full_review" id="full_review" />
                <Label htmlFor="full_review" className="flex-1 cursor-pointer">
                  <div className="font-medium">Full Analysis Review</div>
                  <div className="text-xs text-muted-foreground">Expert validates all scores and recommendations</div>
                </Label>
              </div>
              
              <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted/50 cursor-pointer">
                <RadioGroupItem value="insight_clarification" id="insight_clarification" />
                <Label htmlFor="insight_clarification" className="flex-1 cursor-pointer">
                  <div className="font-medium flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    Clarify Specific Insight
                  </div>
                  <div className="text-xs text-muted-foreground">Ask questions about a particular recommendation</div>
                </Label>
              </div>
              
              <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted/50 cursor-pointer">
                <RadioGroupItem value="consultation_booking" id="consultation_booking" />
                <Label htmlFor="consultation_booking" className="flex-1 cursor-pointer">
                  <div className="font-medium flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4" />
                    Book Consultation Call
                  </div>
                  <div className="text-xs text-muted-foreground">Schedule a call with our UK market expert</div>
                </Label>
              </div>
            </RadioGroup>
          </div>

          {requestType === 'insight_clarification' && (
            <div className="space-y-2">
              <Label htmlFor="question">Your Question</Label>
              <Textarea
                id="question"
                placeholder="What specific aspect of the analysis would you like clarified?"
                value={insightQuestion}
                onChange={(e) => setInsightQuestion(e.target.value)}
                rows={4}
              />
              {insightCategory && (
                <p className="text-xs text-muted-foreground">
                  About: {insightCategory}
                </p>
              )}
            </div>
          )}

          {requestType === 'consultation_booking' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="topic">Consultation Topic</Label>
                <Textarea
                  id="topic"
                  placeholder="What would you like to discuss with our expert?"
                  value={consultationTopic}
                  onChange={(e) => setConsultationTopic(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Preferred Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !consultationDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {consultationDate ? format(consultationDate, "PPP") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={consultationDate}
                        onSelect={setConsultationDate}
                        disabled={(date) => date < new Date() || date < new Date("1900-01-01")}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="time">Preferred Time</Label>
                  <Select value={consultationTime} onValueChange={setConsultationTime}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select time" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="09:00">09:00 AM</SelectItem>
                      <SelectItem value="10:00">10:00 AM</SelectItem>
                      <SelectItem value="11:00">11:00 AM</SelectItem>
                      <SelectItem value="13:00">1:00 PM</SelectItem>
                      <SelectItem value="14:00">2:00 PM</SelectItem>
                      <SelectItem value="15:00">3:00 PM</SelectItem>
                      <SelectItem value="16:00">4:00 PM</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          {requestType === 'full_review' && (
            <div className="space-y-2">
              <Label>Priority Level</Label>
              <Select value={priority} onValueChange={(value: any) => setPriority(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low - Standard review (3-5 business days)</SelectItem>
                  <SelectItem value="medium">Medium - Priority review (2-3 business days)</SelectItem>
                  <SelectItem value="high">High - Urgent review (24-48 hours)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="bg-muted/50 p-3 rounded-lg border">
            <div className="flex gap-2">
              <AlertCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
              <div className="text-xs text-muted-foreground">
                {requestType === 'consultation_booking' 
                  ? "Our team will contact you via email to confirm availability and send calendar invite."
                  : "Expert reviews are provided by certified UK market consultants with 10+ years experience."}
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? 'Submitting...' : 'Submit Request'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
