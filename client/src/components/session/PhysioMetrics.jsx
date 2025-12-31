import { FiPlus, FiTrash2 } from 'react-icons/fi';
import { Card, CardHeader, CardTitle, CardContent, Input, Button } from '../ui';

export function PainScaleSection({ painScale, setPainScale }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Pain Assessment</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Pain Location
          </label>
          <Input
            value={painScale.location}
            onChange={(e) => setPainScale({ ...painScale, location: e.target.value })}
            placeholder="e.g., Lower back, right shoulder..."
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Current Pain (0-10)
            </label>
            <Input
              type="number"
              min="0"
              max="10"
              value={painScale.current}
              onChange={(e) => setPainScale({ ...painScale, current: parseInt(e.target.value) || 0 })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Best (0-10)
            </label>
            <Input
              type="number"
              min="0"
              max="10"
              value={painScale.best}
              onChange={(e) => setPainScale({ ...painScale, best: parseInt(e.target.value) || 0 })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Worst (0-10)
            </label>
            <Input
              type="number"
              min="0"
              max="10"
              value={painScale.worst}
              onChange={(e) => setPainScale({ ...painScale, worst: parseInt(e.target.value) || 0 })}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function RangeOfMotionSection({ rangeOfMotion, addROMEntry, removeROMEntry }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Range of Motion</CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => addROMEntry({ joint: '', movement: '', degrees: '' })}
            leftIcon={<FiPlus />}
          >
            Add
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {rangeOfMotion.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-4">
            No ROM measurements added yet
          </p>
        ) : (
          rangeOfMotion.map((rom, index) => (
            <div key={index} className="flex gap-2 items-start">
              <Input
                placeholder="Joint"
                value={rom.joint}
                onChange={(e) => {
                  const updated = [...rangeOfMotion];
                  updated[index] = { ...rom, joint: e.target.value };
                  // Note: This needs to be connected to the hook
                }}
                className="flex-1"
              />
              <Input
                placeholder="Movement"
                value={rom.movement}
                onChange={(e) => {
                  const updated = [...rangeOfMotion];
                  updated[index] = { ...rom, movement: e.target.value };
                }}
                className="flex-1"
              />
              <Input
                placeholder="Degrees"
                value={rom.degrees}
                onChange={(e) => {
                  const updated = [...rangeOfMotion];
                  updated[index] = { ...rom, degrees: e.target.value };
                }}
                className="w-24"
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeROMEntry(index)}
              >
                <FiTrash2 className="h-4 w-4 text-red-600" />
              </Button>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}

export function StrengthTestSection({ strengthTest, addStrengthEntry, removeStrengthEntry }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Strength Testing</CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => addStrengthEntry({ muscle: '', grade: '' })}
            leftIcon={<FiPlus />}
          >
            Add
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {strengthTest.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-4">
            No strength tests added yet
          </p>
        ) : (
          strengthTest.map((test, index) => (
            <div key={index} className="flex gap-2 items-start">
              <Input
                placeholder="Muscle/Group"
                value={test.muscle}
                className="flex-1"
              />
              <Input
                placeholder="Grade (0-5)"
                value={test.grade}
                className="w-32"
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeStrengthEntry(index)}
              >
                <FiTrash2 className="h-4 w-4 text-red-600" />
              </Button>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
