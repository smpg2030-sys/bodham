import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";

const GOALS = [
  { id: "anxiety", icon: "💙", title: "Reduce Anxiety", subtitle: "Find your calm" },
  { id: "sleep", icon: "🌙", title: "Better Sleep", subtitle: "Rest deeply" },
  { id: "gratitude", icon: "💗", title: "Build Gratitude", subtitle: "Appreciate more" },
  { id: "focus", icon: "⚡", title: "Stay Focused", subtitle: "Sharpen your mind" },
  { id: "stress", icon: "🍃", title: "Stress Relief", subtitle: "Release tension" },
  { id: "esteem", icon: "👤", title: "Self Esteem", subtitle: "Love yourself" },
];

export default function GoalsScreen() {
  const navigate = useNavigate();
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);

  const toggle = (id: string) => {
    setSelectedGoals((prev) =>
      prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id]
    );
  };

  const handleContinue = () => {
    if (selectedGoals.length === 0) return;

    try {
      localStorage.setItem("bodham_goals", JSON.stringify(selectedGoals));
    } catch { }
    navigate("/");
  };

  return (
    <div className="app-container min-h-screen bg-[#f8f9fa] p-6 pb-28 relative">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="absolute top-6 left-6 p-2 rounded-full bg-slate-100 hover:bg-slate-200 transition-colors text-slate-600"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>

      <h2 className="text-3xl font-bold text-center mt-12 mb-2 text-slate-800">
        What brings you to
        <br />
        Bodham?
      </h2>
      <p className="text-slate-500 text-center mb-8">
        Select your mental wellness goals to personalize your experience.
      </p>

      <div className="grid grid-cols-2 gap-4 mb-24">
        {GOALS.map((goal) => (
          <button
            key={goal.id}
            type="button"
            onClick={() => toggle(goal.id)}
            className={`relative rounded-2xl p-4 text-left transition-all border-2 h-full flex flex-col justify-between ${selectedGoals.includes(goal.id)
              ? "border-green-500 bg-green-50 shadow-md transform scale-[1.02]"
              : "border-transparent bg-white shadow-sm hover:shadow-md"
              }`}
          >
            <div className="flex justify-between items-start mb-2">
              <span className="text-3xl">{goal.icon}</span>
              {selectedGoals.includes(goal.id) && (
                <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center text-white text-[10px] font-bold">
                  ✓
                </div>
              )}
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-800 leading-tight mb-1">{goal.title}</h3>
              <p className="text-xs text-slate-500 line-clamp-2">{goal.subtitle}</p>
            </div>
          </button>
        ))}
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-6 bg-white border-t max-w-[430px] mx-auto z-10">
        <button
          type="button"
          onClick={handleContinue}
          disabled={selectedGoals.length === 0}
          className={`w-full py-4 rounded-xl font-bold text-white transition-all ${selectedGoals.length > 0
            ? "bg-gradient-to-r from-green-500 to-emerald-600 shadow-lg shadow-green-200 hover:shadow-xl active:scale-95"
            : "bg-slate-300 cursor-not-allowed"
            }`}
        >
          {selectedGoals.length > 0 ? "Continue" : "Select a goal to continue"}
        </button>
      </div>
    </div>
  );
}
