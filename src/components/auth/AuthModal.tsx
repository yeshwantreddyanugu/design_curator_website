// import React, { useState } from 'react';
// import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
// import LoginForm from './LoginForm';
// import SignupForm from './SignupForm';

// interface AuthModalProps {
//   isOpen: boolean;
//   onClose: () => void;
//   onSuccess?: () => void;
//   defaultMode?: 'login' | 'signup';
//   title?: string;
//   description?: string;
// }

// const AuthModal: React.FC<AuthModalProps> = ({ 
//   isOpen, 
//   onClose, 
//   onSuccess,
//   defaultMode = 'login',
//   title,
//   description
// }) => {
//   const [mode, setMode] = useState<'login' | 'signup'>(defaultMode);

//   const handleSuccess = () => {
//     if (onSuccess) {
//       onSuccess();
//     }
//     onClose();
//   };

//   const switchToLogin = () => setMode('login');
//   const switchToSignup = () => setMode('signup');

//   return (
//     <Dialog open={isOpen} onOpenChange={onClose}>
//       <DialogContent className="sm:max-w-md">
//         {title && (
//           <DialogHeader>
//             <DialogTitle className="font-display text-center">{title}</DialogTitle>
//             {description && (
//               <DialogDescription className="text-center">
//                 {description}
//               </DialogDescription>
//             )}
//           </DialogHeader>
//         )}
        
//         {mode === 'login' ? (
//           <LoginForm 
//             onSuccess={handleSuccess}
//             onSwitchToSignup={switchToSignup}
//           />
//         ) : (
//           <SignupForm 
//             onSuccess={handleSuccess}
//             onSwitchToLogin={switchToLogin}
//           />
//         )}
//       </DialogContent>
//     </Dialog>
//   );
// };

// export default AuthModal;



import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import LoginForm from './LoginForm';
import SignupForm from './SignupForm';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  defaultMode?: 'login' | 'signup';
  title?: string;
  description?: string;
}

const AuthModal: React.FC<AuthModalProps> = ({ 
  isOpen, 
  onClose, 
  onSuccess,
  defaultMode = 'login',
  title,
  description
}) => {
  const [mode, setMode] = useState<'login' | 'signup'>(defaultMode);

  const handleSuccess = () => {
    console.log('Authentication successful');
    if (onSuccess) {
      onSuccess();
    }
    onClose();
  };

  const switchToLogin = () => {
    console.log('Switching to login mode');
    setMode('login');
  };
  
  const switchToSignup = () => {
    console.log('Switching to signup mode');
    setMode('signup');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        {title && (
          <DialogHeader>
            <DialogTitle className="font-display text-center">{title}</DialogTitle>
            {description && (
              <DialogDescription className="text-center">
                {description}
              </DialogDescription>
            )}
          </DialogHeader>
        )}
        
        {mode === 'login' ? (
          <LoginForm 
            onSuccess={handleSuccess}
            onSwitchToSignup={switchToSignup}
          />
        ) : (
          <SignupForm 
            onSuccess={handleSuccess}
            onSwitchToLogin={switchToLogin}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;