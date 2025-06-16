<template>
  <div class="login-view">
    <div class="login-container">
      <div class="login-card">
        <!-- Logo -->
        <div class="logo-section">
          <div class="logo">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/>
            </svg>
          </div>
          <h1>Welcome to Claude</h1>
          <p class="subtitle">Sign in to continue your conversations</p>
        </div>

        <!-- Login Form -->
        <form @submit.prevent="handleLogin" class="login-form">
          <div class="form-group">
            <label for="email">Email</label>
            <input
              id="email"
              v-model="email"
              type="email"
              placeholder="you@example.com"
              required
              class="form-input"
              :disabled="loading"
            />
          </div>

          <div class="form-group">
            <label for="password">Password</label>
            <input
              id="password"
              v-model="password"
              type="password"
              placeholder="Enter your password"
              required
              class="form-input"
              :disabled="loading"
            />
          </div>

          <div class="form-options">
            <label class="checkbox-label">
              <input
                v-model="rememberMe"
                type="checkbox"
                class="checkbox-input"
              />
              <span>Remember me</span>
            </label>

            <a href="#" class="forgot-link">Forgot password?</a>
          </div>

          <button
            type="submit"
            class="login-button"
            :disabled="loading || !isFormValid"
          >
            <LoadingSpinner v-if="loading" size="small" />
            <span v-else>Sign in</span>
          </button>

          <div v-if="error" class="error-message">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {{ error }}
          </div>
        </form>

        <!-- Divider -->
        <div class="divider">
          <span>OR</span>
        </div>

        <!-- Social Login -->
        <div class="social-login">
          <button @click="handleGoogleLogin" class="social-button google">
            <svg viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>

          <button @click="handleGithubLogin" class="social-button github">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.604-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z"/>
            </svg>
            Continue with GitHub
          </button>
        </div>

        <!-- Sign up link -->
        <div class="signup-section">
          <p>Don't have an account? <a href="#" class="signup-link">Sign up</a></p>
        </div>
      </div>

      <!-- Demo Mode -->
      <div class="demo-mode">
        <button @click="handleDemoMode" class="demo-button">
          Try Demo Mode
        </button>
        <p class="demo-text">No login required</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'

const router = useRouter()

// State
const email = ref('')
const password = ref('')
const rememberMe = ref(false)
const loading = ref(false)
const error = ref('')

// Computed
const isFormValid = computed(() => {
  return email.value && password.value.length >= 6
})

// Methods
async function handleLogin() {
  if (!isFormValid.value) return

  loading.value = true
  error.value = ''

  try {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Mock authentication
    if (email.value === 'demo@example.com' && password.value === 'password') {
      // Save token
      localStorage.setItem('authToken', 'mock-jwt-token')

      if (rememberMe.value) {
        localStorage.setItem('rememberedEmail', email.value)
      }

      // Redirect to chat
      router.push('/')
    } else {
      throw new Error('Invalid email or password')
    }
  } catch (err) {
    error.value = err.message || 'An error occurred during login'
  } finally {
    loading.value = false
  }
}

async function handleGoogleLogin() {
  // Implement Google OAuth
  console.log('Google login')
  alert('Google login not implemented in demo')
}

async function handleGithubLogin() {
  // Implement GitHub OAuth
  console.log('GitHub login')
  alert('GitHub login not implemented in demo')
}

function handleDemoMode() {
  // Set demo token
  localStorage.setItem('authToken', 'demo-token')
  router.push('/')
}

// Load remembered email
const rememberedEmail = localStorage.getItem('rememberedEmail')
if (rememberedEmail) {
  email.value = rememberedEmail
  rememberMe.value = true
}
</script>

<style scoped>
.login-view {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--color-sidebar) 0%, var(--color-background) 100%);
  padding: var(--spacing-lg);
}

.login-container {
  width: 100%;
  max-width: 420px;
}

.login-card {
  background: var(--color-surface);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-lg);
  padding: var(--spacing-2xl);
}

.logo-section {
  text-align: center;
  margin-bottom: var(--spacing-2xl);
}

.logo {
  width: 64px;
  height: 64px;
  margin: 0 auto var(--spacing-md);
  color: var(--color-primary);

  svg {
    width: 100%;
    height: 100%;
  }
}

h1 {
  font-size: var(--font-size-2xl);
  font-weight: 700;
  color: var(--color-text-primary);
  margin-bottom: var(--spacing-sm);
}

.subtitle {
  font-size: var(--font-size-base);
  color: var(--color-text-secondary);
  margin: 0;
}

.login-form {
  margin-bottom: var(--spacing-lg);
}

.form-group {
  margin-bottom: var(--spacing-lg);

  label {
    display: block;
    font-size: var(--font-size-sm);
    font-weight: 500;
    color: var(--color-text-primary);
    margin-bottom: var(--spacing-sm);
  }
}

.form-input {
  width: 100%;
  padding: var(--spacing-sm) var(--spacing-md);
  background: var(--color-background);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  font-size: var(--font-size-base);
  color: var(--color-text-primary);
  transition: all var(--transition-fast);

  &::placeholder {
    color: var(--color-text-tertiary);
  }

  &:focus {
    outline: none;
    border-color: var(--color-primary);
    box-shadow: 0 0 0 3px rgba(217, 119, 87, 0.1);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
}

.form-options {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--spacing-lg);
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  cursor: pointer;

  .checkbox-input {
    width: 16px;
    height: 16px;
    cursor: pointer;
  }
}

.forgot-link {
  font-size: var(--font-size-sm);
  color: var(--color-primary);
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
}

.login-button {
  width: 100%;
  padding: var(--spacing-md);
  background: var(--color-primary);
  color: white;
  border: none;
  border-radius: var(--radius-md);
  font-size: var(--font-size-base);
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-fast);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);

  &:hover:not(:disabled) {
    background: var(--color-primary-hover);
    transform: translateY(-1px);
    box-shadow: var(--shadow-md);
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
}

.error-message {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  margin-top: var(--spacing-md);
  padding: var(--spacing-sm) var(--spacing-md);
  background: #fee2e2;
  border: 1px solid #fecaca;
  border-radius: var(--radius-md);
  color: #dc2626;
  font-size: var(--font-size-sm);

  svg {
    width: 16px;
    height: 16px;
    flex-shrink: 0;
  }
}

.divider {
  position: relative;
  text-align: center;
  margin: var(--spacing-xl) 0;

  &::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 0;
    right: 0;
    height: 1px;
    background: var(--color-border);
  }

  span {
    position: relative;
    padding: 0 var(--spacing-md);
    background: var(--color-surface);
    color: var(--color-text-tertiary);
    font-size: var(--font-size-sm);
  }
}

.social-login {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-xl);
}

.social-button {
  width: 100%;
  padding: var(--spacing-md);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  font-size: var(--font-size-base);
  font-weight: 500;
  color: var(--color-text-primary);
  cursor: pointer;
  transition: all var(--transition-fast);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);

  &:hover {
    background: var(--color-sidebar);
    border-color: var(--color-border-light);
    transform: translateY(-1px);
    box-shadow: var(--shadow-sm);
  }

  &:active {
    transform: translateY(0);
  }

  svg {
    width: 20px;
    height: 20px;
  }
}

.signup-section {
  text-align: center;

  p {
    font-size: var(--font-size-sm);
    color: var(--color-text-secondary);
    margin: 0;
  }

  .signup-link {
    color: var(--color-primary);
    text-decoration: none;
    font-weight: 500;

    &:hover {
      text-decoration: underline;
    }
  }
}

.demo-mode {
  margin-top: var(--spacing-lg);
  text-align: center;
}

.demo-button {
  width: 100%;
  padding: var(--spacing-md);
  background: transparent;
  border: 2px dashed var(--color-border);
  border-radius: var(--radius-md);
  font-size: var(--font-size-base);
  font-weight: 500;
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all var(--transition-fast);

  &:hover {
    border-color: var(--color-primary);
    color: var(--color-primary);
    background: var(--color-sidebar);
  }
}

.demo-text {
  font-size: var(--font-size-xs);
  color: var(--color-text-tertiary);
  margin-top: var(--spacing-sm);
}

/* Dark mode adjustments */
.dark {
  .error-message {
    background: rgba(239, 68, 68, 0.1);
    border-color: rgba(239, 68, 68, 0.3);
  }
}

/* Mobile adjustments */
@media (max-width: 768px) {
  .login-card {
    padding: var(--spacing-lg);
  }

  h1 {
    font-size: var(--font-size-xl);
  }
}
</style>