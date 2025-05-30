import React, { useState } from 'react';
import {
  Box,
  Button,
  IconButton,
  MenuItem,
  Select,
  TextField,
  Typography,
  FormControl,
  InputLabel,
  Stack,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';

export interface QueryCondition {
  field: string;
  operator: string;
  value: string;
}

export interface QueryGroup {
  conditions: QueryCondition[];
  operator: 'AND' | 'OR';
}

interface QueryBuilderProps {
  fields: Array<{ name: string; type: string }>;
  onQueryChange: (query: QueryGroup) => void;
}

const OPERATORS = {
  string: ['equals', 'contains', 'startsWith', 'endsWith'],
  number: ['equals', 'greaterThan', 'lessThan', 'between'],
  date: ['equals', 'before', 'after', 'between'],
  boolean: ['equals'],
};

const QueryBuilder: React.FC<QueryBuilderProps> = ({ fields, onQueryChange }) => {
  const [queryGroup, setQueryGroup] = useState<QueryGroup>({
    conditions: [{ field: '', operator: '', value: '' }],
    operator: 'AND',
  });

  const handleOperatorChange = (value: 'AND' | 'OR') => {
    const newQueryGroup = { ...queryGroup, operator: value };
    setQueryGroup(newQueryGroup);
    onQueryChange(newQueryGroup);
  };

  const handleConditionChange = (index: number, field: keyof QueryCondition, value: string) => {
    const newConditions = [...queryGroup.conditions];
    newConditions[index] = { ...newConditions[index], [field]: value };
    
    // Reset operator and value when field changes
    if (field === 'field') {
      newConditions[index].operator = '';
      newConditions[index].value = '';
    }
    
    const newQueryGroup = { ...queryGroup, conditions: newConditions };
    setQueryGroup(newQueryGroup);
    onQueryChange(newQueryGroup);
  };

  const addCondition = () => {
    const newConditions = [...queryGroup.conditions, { field: '', operator: '', value: '' }];
    const newQueryGroup = { ...queryGroup, conditions: newConditions };
    setQueryGroup(newQueryGroup);
    onQueryChange(newQueryGroup);
  };

  const removeCondition = (index: number) => {
    if (queryGroup.conditions.length === 1) return;
    const newConditions = queryGroup.conditions.filter((_, i) => i !== index);
    const newQueryGroup = { ...queryGroup, conditions: newConditions };
    setQueryGroup(newQueryGroup);
    onQueryChange(newQueryGroup);
  };

  const getOperatorsForField = (fieldName: string) => {
    const field = fields.find(f => f.name === fieldName);
    return field ? OPERATORS[field.type as keyof typeof OPERATORS] || [] : [];
  };

  return (
    <Box sx={{ p: 2 }}>
      <Stack spacing={2}>
        <FormControl fullWidth>
          <InputLabel>Group Operator</InputLabel>
          <Select
            value={queryGroup.operator}
            label="Group Operator"
            onChange={(e) => handleOperatorChange(e.target.value as 'AND' | 'OR')}
          >
            <MenuItem value="AND">AND</MenuItem>
            <MenuItem value="OR">OR</MenuItem>
          </Select>
        </FormControl>

        {queryGroup.conditions.map((condition, index) => (
          <Box key={index} sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <FormControl sx={{ flex: 1 }}>
              <InputLabel>Field</InputLabel>
              <Select
                value={condition.field}
                label="Field"
                onChange={(e) => handleConditionChange(index, 'field', e.target.value)}
              >
                {fields.map(field => (
                  <MenuItem key={field.name} value={field.name}>
                    {field.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl sx={{ flex: 1 }}>
              <InputLabel>Operator</InputLabel>
              <Select
                value={condition.operator}
                label="Operator"
                disabled={!condition.field}
                onChange={(e) => handleConditionChange(index, 'operator', e.target.value)}
              >
                {getOperatorsForField(condition.field).map(op => (
                  <MenuItem key={op} value={op}>
                    {op}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              sx={{ flex: 1 }}
              label="Value"
              value={condition.value}
              disabled={!condition.operator}
              onChange={(e) => handleConditionChange(index, 'value', e.target.value)}
            />

            <IconButton
              color="error"
              onClick={() => removeCondition(index)}
              disabled={queryGroup.conditions.length === 1}
            >
              <DeleteIcon />
            </IconButton>
          </Box>
        ))}

        <Box>
          <Button
            startIcon={<AddIcon />}
            onClick={addCondition}
            variant="outlined"
            size="small"
          >
            Add Condition
          </Button>
        </Box>
      </Stack>
    </Box>
  );
};

export default QueryBuilder; 