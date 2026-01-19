import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { colors, spacing, borderRadius, typography, shadows } from '../constants/theme';
import {
  getStarterCode,
  Language,
  languageNames,
} from '../services/compilerService';
import { runCode, submitSolution } from '../services/judgeService';

interface CodeEditorPanelProps {
  onSubmit: (code: string, language: Language) => void;
  isSubmitting: boolean;
  hasSubmitted?: boolean;
  sampleTestcases?: Array<{ input: string; output: string }>;
  submitTestcases?: Array<{ input: string; output: string }>;
}

const languages: Language[] = ['python', 'javascript', 'cpp', 'java', 'c'];

const CodeEditorPanel: React.FC<CodeEditorPanelProps> = ({
  onSubmit,
  isSubmitting,
  hasSubmitted,
  sampleTestcases,
  submitTestcases,
}) => {
  const [code, setCode] = useState(getStarterCode('python'));
  const [language, setLanguage] = useState<Language>('python');
  const [stdin, setStdin] = useState('');
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmittingLocal, setIsSubmittingLocal] = useState(false);
  const [activeTab, setActiveTab] = useState<'code' | 'testcases'>('code');
  const [runResult, setRunResult] = useState<{
    success: boolean;
    label: string;
    time?: string;
    memory?: string;
  } | null>(null);

  const handleLanguageChange = useCallback((newLang: Language) => {
    setLanguage(newLang);
    setCode(getStarterCode(newLang));
    setOutput('');
    setRunResult(null);
  }, []);

  const handleRun = async () => {
    if (!code.trim()) return;

    setIsRunning(true);
    setOutput('');
    setRunResult(null);

    try {
      if (sampleTestcases && sampleTestcases.length > 0) {
        // Run against provided sample testcases and show per-test results
        const resp = await runCode(code, language, { testcases: sampleTestcases });
        // expect resp.results: [{ input, expected, output, verdict, error }]
        const results = resp.results || [];
        const summaryLines = results.map((r: any, idx: number) => {
          const ok = r.verdict === 'Accepted';
          return `Case ${idx + 1}: ${ok ? '✓ Accepted' : '✗ ' + (r.verdict || 'Wrong')}\nInput:\n${r.input}\nExpected:\n${r.expected}\nOutput:\n${r.output || r.error || ''}`;
        });

        const anyFailed = results.some((r: any) => r.verdict !== 'Accepted');
        setRunResult({
          success: !anyFailed,
          label: anyFailed ? 'Sample Failed' : 'Sample Passed',
          time: undefined,
          memory: '12.4 MB',
        });
        setOutput(summaryLines.join('\n\n'));
      } else {
        // Run single stdin execution
        const resp = await runCode(code, language, { stdin });
        // server /run may return { results } or a simple run response; normalize
        if (resp.results && Array.isArray(resp.results)) {
          const first = resp.results[0] || {};
          setRunResult({ success: first.verdict === 'Accepted', label: first.verdict || 'Run complete', time: undefined, memory: '12.4 MB' });
          setOutput(first.output || first.error || '(no output)');
        } else if (resp.success !== undefined) {
          setRunResult({ success: resp.success, label: resp.status || (resp.success ? 'Run complete' : 'Error'), time: resp.executionTime, memory: '12.4 MB' });
          setOutput(resp.output || resp.error || '(no output)');
        } else {
          setOutput(JSON.stringify(resp));
        }
      }
    } catch (error: any) {
      setRunResult({ success: false, label: 'Error' });
      setOutput(error?.message || 'Failed to run code');
    } finally {
      setIsRunning(false);
    }
  };

  const handleSubmit = async () => {
    if (!code.trim()) return;

    if (!submitTestcases || submitTestcases.length === 0) {
      onSubmit(code, language);
      return;
    }

    setIsSubmittingLocal(true);
    setOutput('');
    setRunResult(null);

    try {
      const result = await submitSolution(code, language, submitTestcases);
      const label = result.status || (result.success ? 'Accepted' : 'Wrong Answer');

      setRunResult({
        success: result.success && label === 'Accepted',
        label,
        time: result.executionTime,
      });

      if (result.success) {
        setOutput(result.output || 'All test cases passed.');
      } else if (result.status === 'Wrong Answer') {
        setOutput(
          `Wrong Answer\n\nExpected: ${result.expectedOutput || ''}\nYour Output: ${result.output || ''}`
        );
      } else {
        setOutput(result.error || 'Submission failed');
      }
    } catch (error: any) {
      setRunResult({ success: false, label: 'Error' });
      setOutput(error?.message || 'Failed to submit code');
    } finally {
      setIsSubmittingLocal(false);
    }
  };

  // Calculate line numbers
  const lineCount = code.split('\n').length;
  const lineNumbers = Array.from({ length: Math.max(lineCount, 20) }, (_, i) => i + 1);

  return (
    <View style={styles.container}>
      {/* Editor Header */}
      <View style={styles.editorHeader}>
        <View style={styles.languageSelector}>
          {languages.map((lang) => (
            <TouchableOpacity
              key={lang}
              style={[
                styles.langTab,
                language === lang && styles.langTabActive,
              ]}
              onPress={() => handleLanguageChange(lang)}
            >
              <Text
                style={[
                  styles.langTabText,
                  language === lang && styles.langTabTextActive,
                ]}
              >
                {languageNames[lang]}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Code Editor Area */}
      <View style={styles.editorContainer}>
        <ScrollView 
          style={styles.lineNumbers}
          showsVerticalScrollIndicator={false}
        >
          {lineNumbers.map((num) => (
            <Text key={num} style={styles.lineNumber}>{num}</Text>
          ))}
        </ScrollView>
        <TextInput
          value={code}
          onChangeText={setCode}
          style={styles.codeInput}
          multiline
          autoCapitalize="none"
          autoCorrect={false}
          spellCheck={false}
          placeholder="// Write your code here..."
          placeholderTextColor={colors.textTertiary}
        />
      </View>

      {/* Bottom Section with Tabs */}
      <View style={styles.bottomSection}>
        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'testcases' && styles.tabActive]}
            onPress={() => setActiveTab('testcases')}
          >
            <Text style={[styles.tabText, activeTab === 'testcases' && styles.tabTextActive]}>
              Testcase
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'code' && styles.tabActive]}
            onPress={() => setActiveTab('code')}
          >
            <Text style={[styles.tabText, activeTab === 'code' && styles.tabTextActive]}>
              Output
            </Text>
          </TouchableOpacity>
        </View>

        {/* Tab Content */}
        <View style={styles.tabContent}>
          {activeTab === 'testcases' ? (
            <View style={styles.testcaseContainer}>
              <Text style={styles.inputLabel}>Input:</Text>
              <TextInput
                value={stdin}
                onChangeText={setStdin}
                style={styles.testcaseInput}
                multiline
                placeholder="Enter test input..."
                placeholderTextColor={colors.textTertiary}
              />
            </View>
          ) : (
            <View style={styles.outputContainer}>
              {runResult && (
                <View style={[
                  styles.resultBadge,
                  runResult.success ? styles.resultSuccess : styles.resultError
                ]}>
                  <Text style={[
                    styles.resultText,
                    runResult.success ? styles.resultTextSuccess : styles.resultTextError
                  ]}>
                    {runResult.success ? `✓ ${runResult.label}` : `✗ ${runResult.label}`}
                  </Text>
                  {runResult.success && (
                    <View style={styles.statsRow}>
                      <Text style={styles.statText}>Runtime: {runResult.time}</Text>
                      <Text style={styles.statText}>Memory: {runResult.memory}</Text>
                    </View>
                  )}
                </View>
              )}
              <ScrollView style={styles.outputScroll}>
                <Text style={styles.outputText}>{output || 'Run code to see output'}</Text>
              </ScrollView>
            </View>
          )}
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionBar}>
        <TouchableOpacity
          style={[styles.runButton, isRunning && styles.buttonDisabled]}
          onPress={handleRun}
          disabled={isRunning}
        >
          {isRunning ? (
            <ActivityIndicator color={colors.textPrimary} size="small" />
          ) : (
            <>
              <Text style={styles.runIcon}>▶</Text>
              <Text style={styles.runButtonText}>Run</Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.submitButton,
            (isSubmitting || isSubmittingLocal || hasSubmitted) && styles.buttonDisabled,
          ]}
          onPress={handleSubmit}
          disabled={isSubmitting || isSubmittingLocal || hasSubmitted}
        >
          {isSubmitting || isSubmittingLocal ? (
            <ActivityIndicator color={colors.textWhite} size="small" />
          ) : (
            <Text style={styles.submitButtonText}>
              {hasSubmitted ? '✓ Submitted' : 'Submit'}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgDark,
  },
  editorHeader: {
    backgroundColor: colors.bgEditorHeader,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderDark,
  },
  languageSelector: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  langTab: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.sm,
  },
  langTabActive: {
    backgroundColor: colors.bgEditor,
  },
  langTabText: {
    ...typography.caption,
    color: colors.textTertiary,
  },
  langTabTextActive: {
    color: colors.textLight,
  },
  editorContainer: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: colors.editorBg,
  },
  lineNumbers: {
    width: 40,
    backgroundColor: colors.editorBg,
    paddingTop: spacing.md,
    paddingRight: spacing.sm,
    borderRightWidth: 1,
    borderRightColor: colors.borderDark,
  },
  lineNumber: {
    ...typography.code,
    color: colors.textTertiary,
    textAlign: 'right',
    height: 20,
  },
  codeInput: {
    flex: 1,
    ...typography.code,
    color: colors.editorText,
    padding: spacing.md,
    textAlignVertical: 'top',
  },
  bottomSection: {
    height: 180,
    backgroundColor: colors.bgEditorHeader,
    borderTopWidth: 1,
    borderTopColor: colors.borderDark,
  },
  tabsContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.borderDark,
  },
  tab: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: colors.primary,
  },
  tabText: {
    ...typography.bodySmall,
    color: colors.textTertiary,
  },
  tabTextActive: {
    color: colors.textLight,
  },
  tabContent: {
    flex: 1,
    padding: spacing.md,
  },
  testcaseContainer: {
    flex: 1,
  },
  inputLabel: {
    ...typography.caption,
    color: colors.textTertiary,
    marginBottom: spacing.sm,
  },
  testcaseInput: {
    flex: 1,
    ...typography.code,
    color: colors.editorText,
    backgroundColor: colors.editorBg,
    borderRadius: borderRadius.sm,
    padding: spacing.sm,
  },
  outputContainer: {
    flex: 1,
  },
  resultBadge: {
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
  },
  resultSuccess: {
    backgroundColor: colors.successBg,
  },
  resultError: {
    backgroundColor: colors.errorBg,
  },
  resultText: {
    ...typography.body,
    fontWeight: '600',
  },
  resultTextSuccess: {
    color: colors.success,
  },
  resultTextError: {
    color: colors.error,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.lg,
    marginTop: spacing.xs,
  },
  statText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  outputScroll: {
    flex: 1,
    backgroundColor: colors.editorBg,
    borderRadius: borderRadius.sm,
    padding: spacing.sm,
  },
  outputText: {
    ...typography.code,
    color: colors.editorText,
  },
  actionBar: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.bgEditorHeader,
    borderTopWidth: 1,
    borderTopColor: colors.borderDark,
  },
  runButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.bgSecondary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.md,
  },
  runIcon: {
    color: colors.success,
    fontSize: 12,
  },
  runButtonText: {
    ...typography.body,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  submitButton: {
    backgroundColor: colors.success,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xxl,
    borderRadius: borderRadius.md,
    ...shadows.sm,
  },
  submitButtonText: {
    ...typography.body,
    fontWeight: '600',
    color: colors.textWhite,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});

export default CodeEditorPanel;
