import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Header from '../components/Header';
import { useAuth } from '../context/AuthContext';
import { getWorkoutById, updateWorkout } from '../services/apiService';

const EditWorkout = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();
  const [workoutName, setWorkoutName] = useState('');
  const [notes, setNotes] = useState('');
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchWorkout = async () => {
      try {
        const workout = await getWorkoutById(id);
        setWorkoutName(workout.name);
        setNotes(workout.notes || '');
        setExercises(workout.exercises.map(exercise => ({
          id: exercise.id || Date.now(),
          name: exercise.name,
          sets: exercise.sets.map(set => ({
            id: set.id || Date.now(),
            reps: set.reps.toString(),
            weightLbs: set.weightLbs.toString()
          }))
        })));
      } catch (error) {
        console.error('Error fetching workout:', error);
        alert('Failed to load workout. Please try again.');
        navigate('/dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchWorkout();
  }, [id, navigate]);

  const addExercise = () => {
    setExercises([...exercises, {
      id: Date.now(),
      name: '',
      sets: [{ id: Date.now(), reps: '', weightLbs: '' }]
    }]);
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
    
    if (!workoutName.trim()) {
      alert('Please enter a workout name');
      return;
    }

    if (exercises.length === 0) {
      alert('Please add at least one exercise');
      return;
    }

    // Validate exercises
    for (let exercise of exercises) {
      if (!exercise.name.trim()) {
        alert('Please enter a name for all exercises');
        return;
      }
      for (let set of exercise.sets) {
        const reps = parseInt(set.reps);
        const weight = parseInt(set.weightLbs);
        if (isNaN(reps) || reps <= 0 || isNaN(weight) || weight < 0) {
          alert('Please enter valid reps and weight for all sets');
          return;
        }
      }
    }

    setSaving(true);

    try {
      const workoutData = {
        name: workoutName,
        notes: notes,
        exercises: exercises.map(exercise => ({
          name: exercise.name,
          sets: exercise.sets.map(set => ({
            reps: parseInt(set.reps),
            weightLbs: parseInt(set.weightLbs)
          }))
        }))
      };

      await updateWorkout(id, workoutData);
      navigate('/dashboard');
    } catch (error) {
      console.error('Error updating workout:', error);
      alert('Failed to update workout. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-base-100">
        <Header />
        <div className="container mx-auto p-4">
          <div className="flex justify-center items-center h-64">
            <span className="loading loading-spinner loading-lg"></span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-100">
      <Header />
      
      <div className="container mx-auto p-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Edit Workout</h1>
          
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
                className={`btn btn-primary ${saving ? 'loading' : ''}`}
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditWorkout; 