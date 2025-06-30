"use client";
// import React from 'react';
// import { LoginForm, AuthProvider } from '@tjsglion/sso-auth-ui';

// // 最简单的配置
// const config = {
//   apiUrl: 'http://localhost:5173',
//   appName: '我的应用',
//   redirectUrl: 'http://localhost:3000/auth/callback',
//   authMethods: {
//     emailPassword: { enabled: true },
//     sso: { enabled: false }
//   }
// };

// export default function LoginPage() {
//   return (
//     <div className="container mx-auto py-10">
//       <AuthProvider config={config}>
//         <LoginForm
//           onLoginSuccess={(user) => {
//             console.log('登录成功:', user);
//             window.location.href = '/dashboard';
//           }}
//           onLoginError={(error) => {
//             console.error('登录失败:', error);
//             alert('登录失败: ' + error.message);
//           }}
//         />
//       </AuthProvider>
//     </div>
//   );
// }

import React, { useState } from 'react';
import { AuthProvider, LoginForm, RegisterForm, createTheme } from '@tjsglion/sso-auth-ui';

// 完整配置
const config = {
  apiUrl: 'http://localhost:5173',
  appName: '我的应用',
  // appLogo: '/logo.png',
  redirectUrl: 'http://localhost:3000/auth/callback',
  authMethods: {
    emailPassword: {
      enabled: true,
      allowRegistration: true,
      allowPasswordReset: true
    },
    sso: {
      enabled: true,
      providers: [
        {
          id: 'google',
          name: 'Google',
          type: 'oauth2',
          clientId: 'your-google-client-id',
          iconSvg: '<svg>...</svg>'
        },
        {
          id: 'github',
          name: 'GitHub',
          type: 'oauth2',
          clientId: 'your-github-client-id',
          iconSvg: '<svg>...</svg>'
        }
      ]
    },
    phone: { enabled: true },
    twoFactor: { enabled: true }
  }
};

// 自定义主题
const theme = createTheme({
  primaryColor: '#3b82f6',
  backgroundColor: '#ffffff',
  textColor: '#1f2937',
  borderRadius: '8px'
});

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <AuthProvider config={config}>
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">
              {isLogin ? '登录' : '注册'}
            </h2>
          </div>

          <div className="bg-white py-8 px-6 shadow rounded-lg">
            <div className="flex mb-6">
              <button
                className={`flex-1 py-2 px-4 rounded-md ${
                  isLogin ? 'bg-blue-600 text-white' : 'text-gray-500'
                }`}
                onClick={() => setIsLogin(true)}
              >
                登录
              </button>
              <button
                className={`flex-1 py-2 px-4 rounded-md ${
                  !isLogin ? 'bg-blue-600 text-white' : 'text-gray-500'
                }`}
                onClick={() => setIsLogin(false)}
              >
                注册
              </button>
            </div>

            {isLogin ? (
              <LoginForm
                theme={theme}
                onLoginSuccess={(user) => {
                  localStorage.setItem('user', JSON.stringify(user));
                  window.location.href = '/dashboard';
                }}
                onLoginError={(error) => alert('登录失败: ' + error.message)}
                showRememberMe={true}
                showForgotPassword={true}
              />
            ) : (
              <RegisterForm
                theme={theme}
                onRegisterSuccess={(user) => {
                  alert('注册成功！');
                  setIsLogin(true);
                }}
                onRegisterError={(error) => alert('注册失败: ' + error.message)}
                confirmPassword={true}
                termsUrl="/terms"
                privacyUrl="/privacy"
              />
            )}
          </div>
        </div>
      </div>
    </AuthProvider>
  );
}