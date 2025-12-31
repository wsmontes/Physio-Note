import { Card, CardHeader, CardTitle, CardContent, Textarea } from '../ui';

export function SOAPNoteEditor({ 
  subjective, 
  setSubjective,
  objective,
  setObjective,
  assessment,
  setAssessment,
  plan,
  setPlan
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>SOAP Note</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Subjective
          </label>
          <Textarea
            value={subjective}
            onChange={(e) => setSubjective(e.target.value)}
            placeholder="Patient's chief complaint, history, symptoms..."
            rows={4}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Objective
          </label>
          <Textarea
            value={objective}
            onChange={(e) => setObjective(e.target.value)}
            placeholder="Clinical observations, measurements, test results..."
            rows={4}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Assessment
          </label>
          <Textarea
            value={assessment}
            onChange={(e) => setAssessment(e.target.value)}
            placeholder="Clinical diagnosis, analysis, progress..."
            rows={4}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Plan
          </label>
          <Textarea
            value={plan}
            onChange={(e) => setPlan(e.target.value)}
            placeholder="Treatment plan, interventions, follow-up..."
            rows={4}
          />
        </div>
      </CardContent>
    </Card>
  );
}
