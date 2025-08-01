import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';
import { createWorkout } from '../services/apiService';

const CreateWorkout = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [workoutName, setWorkoutName] = useState('');
  const [notes, setNotes] = useState('');
  const [exercises, setExercises] = useState([
    {
      id: Date.now(),
      name: '',
      sets: [
        {
          id: Date.now() + 1,
          reps: '',
          weightLbs: ''
        }
      ]
    }
  ]);
  const [loading, setLoading] = useState(false);

  const addExercise = () => {
    setExercises([
      ...exercises,
      {
        id: Date.now(),
        name: '',
        sets: [
          {
            id: Date.now() + 1,
            reps: '',
            weightLbs: ''
          }
        ]
      }
    ]);
  };

  const removeExercise = (exerciseIndex) => {
    setExercises(exercises.filter((_, index) => index !== exerciseIndex));
  };

  const updateExerciseName = (exerciseIndex, name) => {
    const updatedExercises = [...exercises];
    updatedExercises[exerciseIndex].name = name;
    setExercises(updatedExercises);
  };

  const addSet = (exerciseIndex) => {
    const updatedExercises = [...exercises];
    updatedExercises[exerciseIndex].sets.push({
      id: Date.now(),
      reps: '',
      weightLbs: ''
    });
    setExercises(updatedExercises);
  };

  const removeSet = (exerciseIndex, setIndex) => {
    const updatedExercises = [...exercises];
    updatedExercises[exerciseIndex].sets.splice(setIndex, 1);
    setExercises(updatedExercises);
  };

  const updateSet = (exerciseIndex, setIndex, field, value) => {
    const updatedExercises = [...exercises];
    updatedExercises[exerciseIndex].sets[setIndex][field] = value;
    setExercises(updatedExercises);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const workoutData = {
        name: workoutName,
        notes: notes,
        date: new Date().toISOString().split('T')[0],
        exercises: exercises.map(exercise => ({
          name: exercise.name,
          sets: exercise.sets.map(set => ({
            reps: parseInt(set.reps),
            weightLbs: parseInt(set.weightLbs)
          }))
        }))
      };

      await createWorkout(workoutData);
      navigate('/dashboard');
    } catch (error) {
      console.error('Error creating workout:', error);
      alert('Failed to create workout. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-base-100">
      <Header />
      
      <div className="container mx-auto p-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Create New Workout</h1>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Workout Details */}
            <div className="card bg-base-200 p-6">
              <h2 className="text-xl font-semibold mb-4">Workout Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="label">
                    <span className="label-text">Workout Name</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Upper Body, Leg Day"
                    className="input input-bordered w-full"
                    value={workoutName}
                    onChange={(e) => setWorkoutName(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="label">
                    <span className="label-text">Notes (Optional)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Any notes about this workout"
                    className="input input-bordered w-full"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Exercises */}
            <div className="card bg-base-200 p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Exercises</h2>
                <button
                  type="button"
                  onClick={addExercise}
                  className="btn btn-primary"
                >
                  Add Exercise
                </button>
              </div>

              {exercises.map((exercise, exerciseIndex) => (
                <div key={exercise.id} className="card bg-base-100 p-4 mb-4">
                  <div className="flex justify-between items-center mb-4">
                    <input
                      type="text"
                      placeholder="Exercise name (e.g., Bench Press)"
                      className="input input-bordered flex-1 mr-4"
                      value={exercise.name}
                      onChange={(e) => updateExerciseName(exerciseIndex, e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => removeExercise(exerciseIndex)}
                      className="btn btn-error btn-sm"
                      disabled={exercises.length === 1}
                    >
                      Remove
                    </button>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <h3 className="font-medium">Sets</h3>
                      <button
                        type="button"
                        onClick={() => addSet(exerciseIndex)}
                        className="btn btn-sm btn-outline"
                      >
                        Add Set
                      </button>
                    </div>

                    {exercise.sets.map((set, setIndex) => (
                      <div key={set.id} className="flex gap-2 items-center">
                        <span className="text-sm font-medium w-12">Set {setIndex + 1}:</span>
                        <input
                          type="number"
                          placeholder="Reps"
                          className="input input-bordered input-sm w-20"
                          value={set.reps}
                          onChange={(e) => updateSet(exerciseIndex, setIndex, 'reps', e.target.value)}
                          required
                        />
                        <span className="text-sm">reps</span>
                        <input
                          type="number"
                          placeholder="Weight"
                          className="input input-bordered input-sm w-20"
                          value={set.weightLbs}
                          onChange={(e) => updateSet(exerciseIndex, setIndex, 'weightLbs', e.target.value)}
                          required
                        />
                        <span className="text-sm">lbs</span>
                        <button
                          type="button"
                          onClick={() => removeSet(exerciseIndex, setIndex)}
                          className="btn btn-error btn-xs"
                          disabled={exercise.sets.length === 1}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-4">
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="btn btn-outline"
              >
                Cancel
              </button>
              <button
                type="submit"
                className={`btn btn-primary ${loading ? 'loading' : ''}`}
                disabled={loading}
              >
                {loading ? 'Creating...' : 'Create Workout'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateWorkout; 