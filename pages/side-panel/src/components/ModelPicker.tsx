import { useEffect, useState } from 'react';
import {
  AgentNameEnum,
  agentModelStore,
  getDefaultAgentModelParams,
  ProviderTypeEnum,
} from '@extension/storage';
import { labelForOwebModel, OWEB_MODEL_OPTIONS } from '../lib/owebModels';

interface ModelPickerProps {
  isDarkMode?: boolean;
  disabled?: boolean;
}

export default function ModelPicker({ isDarkMode = false, disabled = false }: ModelPickerProps) {
  const [modelId, setModelId] = useState<string>(OWEB_MODEL_OPTIONS[0].id);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const planner = await agentModelStore.getAgentModel(AgentNameEnum.Planner);
        if (!cancelled && planner?.modelName) {
          setModelId(planner.modelName);
        }
      } catch (err) {
        console.error('Failed to load agent model', err);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const onChange = async (next: string) => {
    if (next === modelId || busy) return;
    setBusy(true);
    setModelId(next);
    try {
      for (const agent of [AgentNameEnum.Planner, AgentNameEnum.Navigator]) {
        await agentModelStore.setAgentModel(agent, {
          provider: ProviderTypeEnum.OWeb,
          modelName: next,
          parameters: getDefaultAgentModelParams(ProviderTypeEnum.OWeb, agent),
        });
      }
    } catch (err) {
      console.error('Failed to update model', err);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="model-picker">
      <label className="model-picker-label" htmlFor="oweb-model-select">
        Model
      </label>
      <select
        id="oweb-model-select"
        className={`model-picker-select ${isDarkMode ? 'is-dark' : 'is-light'}`}
        value={modelId}
        disabled={disabled || busy}
        onChange={e => void onChange(e.target.value)}
        aria-label="Select Gemini model"
        title={labelForOwebModel(modelId)}>
        {OWEB_MODEL_OPTIONS.map(opt => (
          <option key={opt.id} value={opt.id}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
