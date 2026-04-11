/**
 * Professor Tony - Premium Interactions
 * Refined, purposeful animations inspired by Apple
 */

(function() {
    'use strict';

    // Wait for DOM
    document.addEventListener('DOMContentLoaded', init);

    function init() {
        initNavigation();
        initScrollProgress();
        initScrollAnimations();
        initSmoothScroll();
        initThemeToggle();
        initImageReveal();
        initParallax();
        initCounterAnimation();
        initCustomCursor();
        initMagneticButtons();
        initPageTransitions();
        initEasterEggs();
        initBackToTop();
    }

    /**
     * Navigation - Frosted glass effect on scroll
     */
    function initNavigation() {
        const nav = document.querySelector('.nav-wrapper');
        const toggle = document.querySelector('.nav-toggle');
        const menu = document.querySelector('.nav-menu');

        if (!nav) return;

        // Scroll handler with throttle
        let ticking = false;
        let lastScroll = 0;

        function handleScroll() {
            const currentScroll = window.pageYOffset;

            if (currentScroll > 10) {
                nav.classList.add('scrolled');
            } else {
                nav.classList.remove('scrolled');
            }

            lastScroll = currentScroll;
            ticking = false;
        }

        window.addEventListener('scroll', function() {
            if (!ticking) {
                requestAnimationFrame(handleScroll);
                ticking = true;
            }
        }, { passive: true });

        // Initial check
        handleScroll();

        // Mobile menu toggle
        if (toggle && menu) {
            toggle.addEventListener('click', function() {
                const isOpen = menu.classList.contains('active');

                toggle.classList.toggle('active');
                menu.classList.toggle('active');

                // Prevent body scroll when menu is open
                document.body.style.overflow = isOpen ? '' : 'hidden';
            });

            // Close menu when clicking links
            menu.querySelectorAll('a').forEach(function(link) {
                link.addEventListener('click', function() {
                    toggle.classList.remove('active');
                    menu.classList.remove('active');
                    document.body.style.overflow = '';
                });
            });
        }

        // Close menu on escape
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && menu && menu.classList.contains('active')) {
                toggle.classList.remove('active');
                menu.classList.remove('active');
                document.body.style.overflow = '';
            }
        });

        // Handle resize
        let resizeTimer;
        window.addEventListener('resize', function() {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(function() {
                if (window.innerWidth > 768 && menu && menu.classList.contains('active')) {
                    toggle.classList.remove('active');
                    menu.classList.remove('active');
                    document.body.style.overflow = '';
                }
            }, 100);
        });
    }

    /**
     * Scroll Animations - Reveal elements as they enter viewport
     */
    function initScrollAnimations() {
        // Elements to animate
        const animateElements = document.querySelectorAll('.animate-on-scroll');
        const staggerElements = document.querySelectorAll('.stagger-children');

        // Also animate sections, cards, and other key elements
        const autoAnimateSelectors = [
            '.hero',
            '.course-card',
            '.resource-card',
            '.step-card',
            '.about-grid',
            '.cert-layout',
            '.pro-tip',
            '.section-header'
        ];

        const autoAnimateElements = document.querySelectorAll(autoAnimateSelectors.join(', '));

        if (!('IntersectionObserver' in window)) {
            // Fallback: show all elements
            animateElements.forEach(el => el.classList.add('visible'));
            staggerElements.forEach(el => el.classList.add('visible'));
            autoAnimateElements.forEach(el => {
                el.style.opacity = '1';
                el.style.transform = 'none';
            });
            return;
        }

        // Observer options
        const observerOptions = {
            root: null,
            rootMargin: '0px 0px -10% 0px',
            threshold: 0.1
        };

        // Create observer
        const observer = new IntersectionObserver(function(entries) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');

                    // Add subtle animation styles if not using CSS classes
                    if (!entry.target.classList.contains('animate-on-scroll') &&
                        !entry.target.classList.contains('stagger-children')) {
                        entry.target.style.opacity = '1';
                        entry.target.style.transform = 'translateY(0)';
                    }

                    // Unobserve after animation
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        // Observe animate-on-scroll elements
        animateElements.forEach(function(el) {
            observer.observe(el);
        });

        // Observe stagger elements
        staggerElements.forEach(function(el) {
            observer.observe(el);
        });

        // Setup and observe auto-animate elements
        autoAnimateElements.forEach(function(el, index) {
            // Set initial state
            el.style.opacity = '0';
            el.style.transform = 'translateY(30px)';
            el.style.transition = 'opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1), transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)';
            el.style.transitionDelay = (index % 3) * 100 + 'ms';

            observer.observe(el);
        });

        // Trigger hero animation immediately
        const hero = document.querySelector('.hero');
        if (hero) {
            setTimeout(function() {
                hero.style.opacity = '1';
                hero.style.transform = 'translateY(0)';
            }, 100);
        }
    }

    /**
     * Smooth Scroll - For anchor links
     */
    function initSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
            anchor.addEventListener('click', function(e) {
                const href = this.getAttribute('href');

                if (href === '#') return;

                const target = document.querySelector(href);
                if (!target) return;

                e.preventDefault();

                const navHeight = document.querySelector('.nav-wrapper')?.offsetHeight || 48;
                const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - navHeight - 20;

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });

                // Update URL without jumping
                history.pushState(null, '', href);
            });
        });
    }

    /**
     * Theme Toggle - Dark/Light mode
     */
    function initThemeToggle() {
        const toggleBtn = document.querySelector('.theme-toggle');
        if (!toggleBtn) return;

        // Get saved theme or system preference
        const savedTheme = localStorage.getItem('theme');
        const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

        // Set initial theme
        if (savedTheme) {
            document.documentElement.setAttribute('data-theme', savedTheme);
        } else if (systemDark) {
            document.documentElement.setAttribute('data-theme', 'dark');
        }

        // Toggle theme on click
        toggleBtn.addEventListener('click', function() {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
        });

        // Listen for system theme changes
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function(e) {
            if (!localStorage.getItem('theme')) {
                document.documentElement.setAttribute('data-theme', e.matches ? 'dark' : 'light');
            }
        });
    }

    /**
     * Scroll Progress Indicator - Shows reading progress
     */
    function initScrollProgress() {
        // Create progress bar element
        const progressBar = document.createElement('div');
        progressBar.className = 'scroll-progress';
        progressBar.style.cssText = `
            position: fixed;
            top: 48px;
            left: 0;
            width: 0%;
            height: 2px;
            background: var(--accent, #0071e3);
            z-index: 9998;
            transition: width 0.15s ease-out;
            pointer-events: none;
            opacity: 0.8;
        `;
        document.body.appendChild(progressBar);

        let ticking = false;

        function updateProgress() {
            const scrollTop = window.pageYOffset;
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
            progressBar.style.width = progress + '%';
            ticking = false;
        }

        window.addEventListener('scroll', function() {
            if (!ticking) {
                requestAnimationFrame(updateProgress);
                ticking = true;
            }
        }, { passive: true });
    }

    /**
     * Image Reveal - Smooth image loading animation
     */
    function initImageReveal() {
        const images = document.querySelectorAll('img[loading="lazy"], .img-reveal img');

        images.forEach(function(img) {
            if (img.complete) {
                img.classList.add('loaded');
            } else {
                img.addEventListener('load', function() {
                    img.classList.add('loaded');
                });
            }
        });

        // Add reveal animation to image containers
        const imgRevealContainers = document.querySelectorAll('.img-reveal');
        if (imgRevealContainers.length && 'IntersectionObserver' in window) {
            const imgObserver = new IntersectionObserver(function(entries) {
                entries.forEach(function(entry) {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('visible');
                        imgObserver.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.2 });

            imgRevealContainers.forEach(function(container) {
                imgObserver.observe(container);
            });
        }
    }

    /**
     * Parallax Effect - Subtle depth on scroll
     */
    function initParallax() {
        const parallaxElements = document.querySelectorAll('.parallax');
        if (!parallaxElements.length) return;

        let ticking = false;

        function updateParallax() {
            const scrollTop = window.pageYOffset;

            parallaxElements.forEach(function(el) {
                const speed = el.dataset.speed || 0.5;
                const yPos = -(scrollTop * speed);
                el.style.transform = 'translate3d(0, ' + yPos + 'px, 0)';
            });

            ticking = false;
        }

        window.addEventListener('scroll', function() {
            if (!ticking) {
                requestAnimationFrame(updateParallax);
                ticking = true;
            }
        }, { passive: true });
    }

    /**
     * Counter Animation - Animate numbers on scroll
     */
    function initCounterAnimation() {
        const counters = document.querySelectorAll('.metric-value span, .stat-number');
        if (!counters.length || !('IntersectionObserver' in window)) return;

        const counterObserver = new IntersectionObserver(function(entries) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting) {
                    const target = entry.target;
                    const text = target.textContent;
                    const num = parseInt(text.replace(/\D/g, ''));

                    if (!isNaN(num) && num > 0) {
                        animateCounter(target, num, text);
                    }

                    counterObserver.unobserve(target);
                }
            });
        }, { threshold: 0.5 });

        counters.forEach(function(counter) {
            counterObserver.observe(counter);
        });

        function animateCounter(element, target, originalText) {
            const duration = 1500;
            const step = target / (duration / 16);
            let current = 0;
            const suffix = originalText.replace(/[\d,]/g, '');

            function update() {
                current += step;
                if (current < target) {
                    element.textContent = Math.floor(current).toLocaleString() + suffix;
                    requestAnimationFrame(update);
                } else {
                    element.textContent = originalText;
                }
            }

            element.textContent = '0' + suffix;
            requestAnimationFrame(update);
        }
    }

    /**
     * Custom Cursor - Blend mode spotlight with text detection
     */
    function initCustomCursor() {
        // Skip on touch devices
        if ('ontouchstart' in window || navigator.maxTouchPoints > 0) return;
        if (window.matchMedia('(max-width: 768px)').matches) return;

        // Create cursor elements
        const cursor = document.createElement('div');
        cursor.className = 'custom-cursor';
        document.body.appendChild(cursor);

        const cursorRing = document.createElement('div');
        cursorRing.className = 'custom-cursor-ring';
        document.body.appendChild(cursorRing);

        let mouseX = 0;
        let mouseY = 0;
        let cursorX = 0;
        let cursorY = 0;
        let ringX = 0;
        let ringY = 0;

        // Interactive elements that trigger hover state
        const interactiveSelectors = 'a, button, .btn, .course-card, .resource-card, .download-card, .testimonial-card, .nav-link, input, textarea, [role="button"]';

        // Text elements for I-beam cursor
        const textSelectors = 'p, h1, h2, h3, h4, h5, h6, span, li, blockquote, .hero-intro, .section-intro';

        // Track mouse movement
        document.addEventListener('mousemove', function(e) {
            mouseX = e.clientX;
            mouseY = e.clientY;

            // Show cursor when mouse enters viewport
            cursor.classList.add('visible');
            cursorRing.classList.add('visible');
        });

        // Hide when leaving window
        document.addEventListener('mouseleave', function() {
            cursor.classList.remove('visible');
            cursorRing.classList.remove('visible');
        });

        // Hover state for interactive elements
        document.querySelectorAll(interactiveSelectors).forEach(function(el) {
            el.addEventListener('mouseenter', function() {
                cursor.classList.remove('text-hover');
                cursorRing.classList.remove('text-hover');
                cursor.classList.add('hovering');
                cursorRing.classList.add('hovering');
            });

            el.addEventListener('mouseleave', function() {
                cursor.classList.remove('hovering');
                cursorRing.classList.remove('hovering');
            });
        });

        // Text hover state - I-beam cursor
        document.querySelectorAll(textSelectors).forEach(function(el) {
            // Skip if it's inside an interactive element
            if (el.closest(interactiveSelectors)) return;

            el.addEventListener('mouseenter', function() {
                if (!cursor.classList.contains('hovering')) {
                    cursor.classList.add('text-hover');
                    cursorRing.classList.add('text-hover');
                }
            });

            el.addEventListener('mouseleave', function() {
                cursor.classList.remove('text-hover');
                cursorRing.classList.remove('text-hover');
            });
        });

        // Click state
        document.addEventListener('mousedown', function() {
            cursor.classList.add('clicking');
            cursorRing.classList.add('clicking');
        });

        document.addEventListener('mouseup', function() {
            cursor.classList.remove('clicking');
            cursorRing.classList.remove('clicking');
        });

        // Smooth animation loop with variable speed
        function animateCursor() {
            // Cursor follows with smooth easing
            const cursorSpeed = cursor.classList.contains('hovering') ? 0.15 : 0.25;
            cursorX += (mouseX - cursorX) * cursorSpeed;
            cursorY += (mouseY - cursorY) * cursorSpeed;
            cursor.style.left = cursorX + 'px';
            cursor.style.top = cursorY + 'px';

            // Ring follows with more lag for trailing effect
            const ringSpeed = cursor.classList.contains('hovering') ? 0.08 : 0.12;
            ringX += (mouseX - ringX) * ringSpeed;
            ringY += (mouseY - ringY) * ringSpeed;
            cursorRing.style.left = ringX + 'px';
            cursorRing.style.top = ringY + 'px';

            requestAnimationFrame(animateCursor);
        }

        animateCursor();
    }

    /**
     * Magnetic Buttons - Subtle attraction effect on CTAs
     */
    function initMagneticButtons() {
        // Skip on touch devices
        if ('ontouchstart' in window || navigator.maxTouchPoints > 0) return;
        if (window.matchMedia('(max-width: 768px)').matches) return;

        const magneticButtons = document.querySelectorAll('.btn-primary, .btn-outline, .hero-cta .btn');
        const magnetStrength = 0.3; // How much the button moves (0-1)
        const magnetDistance = 80; // Pixels from center to start attracting

        magneticButtons.forEach(function(btn) {
            btn.addEventListener('mousemove', function(e) {
                const rect = btn.getBoundingClientRect();
                const centerX = rect.left + rect.width / 2;
                const centerY = rect.top + rect.height / 2;

                const deltaX = e.clientX - centerX;
                const deltaY = e.clientY - centerY;
                const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

                if (distance < magnetDistance) {
                    const pull = (1 - distance / magnetDistance) * magnetStrength;
                    const moveX = deltaX * pull;
                    const moveY = deltaY * pull;

                    btn.style.transform = 'translate(' + moveX + 'px, ' + moveY + 'px)';
                }
            });

            btn.addEventListener('mouseleave', function() {
                btn.style.transform = 'translate(0, 0)';
            });

            // Reset on click for proper feedback
            btn.addEventListener('mousedown', function() {
                btn.style.transition = 'transform 0.1s ease-out';
            });

            btn.addEventListener('mouseup', function() {
                btn.style.transition = 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)';
            });
        });
    }

    /**
     * Page Transitions - Smooth navigation between pages
     */
    function initPageTransitions() {
        // Add page-content class to main for animation
        const main = document.querySelector('main');
        if (main) {
            main.classList.add('page-content');
        }

        // Create transition overlay
        const transitionEl = document.createElement('div');
        transitionEl.className = 'page-transition';
        document.body.appendChild(transitionEl);

        // Intercept internal link clicks for smooth transitions
        document.querySelectorAll('a[href]').forEach(function(link) {
            const href = link.getAttribute('href');

            // Only apply to internal HTML links (not anchors, external, or downloads)
            if (href &&
                !href.startsWith('#') &&
                !href.startsWith('http') &&
                !href.startsWith('mailto') &&
                !href.startsWith('tel') &&
                href.endsWith('.html')) {

                link.addEventListener('click', function(e) {
                    e.preventDefault();

                    // Trigger exit animation
                    if (main) {
                        main.classList.add('page-exit');
                    }
                    transitionEl.classList.add('active');

                    // Navigate after animation
                    setTimeout(function() {
                        window.location.href = href;
                    }, 300);
                });
            }
        });
    }

    /**
     * Easter Eggs - Hidden delights
     */
    function initEasterEggs() {
        // Konami Code: Up Up Down Down Left Right Left Right B A
        const konamiCode = [38, 38, 40, 40, 37, 39, 37, 39, 66, 65];
        let konamiIndex = 0;

        document.addEventListener('keydown', function(e) {
            if (e.keyCode === konamiCode[konamiIndex]) {
                konamiIndex++;

                if (konamiIndex === konamiCode.length) {
                    // Konami code completed!
                    triggerKonamiCelebration();
                    konamiIndex = 0;
                }
            } else {
                konamiIndex = 0;
            }
        });

        // Logo click counter Easter egg
        const logoMark = document.querySelector('.nav-logo-mark');
        let logoClickCount = 0;
        let logoClickTimer = null;

        if (logoMark) {
            logoMark.addEventListener('click', function(e) {
                e.preventDefault();
                logoClickCount++;
                logoMark.classList.add('clicked');

                setTimeout(function() {
                    logoMark.classList.remove('clicked');
                }, 300);

                // Reset counter after 2 seconds of no clicks
                clearTimeout(logoClickTimer);
                logoClickTimer = setTimeout(function() {
                    logoClickCount = 0;
                }, 2000);

                // Trigger after 5 rapid clicks
                if (logoClickCount >= 5) {
                    triggerLogoEasterEgg();
                    logoClickCount = 0;
                }
            });
        }
    }

    function triggerKonamiCelebration() {
        // Add celebration class to body
        document.body.classList.add('konami-activated');

        // Create confetti
        const colors = ['#0071e3', '#bf4800', '#34c759', '#7c3aed', '#f97316'];

        for (let i = 0; i < 50; i++) {
            setTimeout(function() {
                createConfetti(colors[Math.floor(Math.random() * colors.length)]);
            }, i * 50);
        }

        // Remove celebration class after animation
        setTimeout(function() {
            document.body.classList.remove('konami-activated');
        }, 1000);

        // Show a fun message
        showEasterEggMessage('You found the Konami Code! You\'re officially a power user.');
    }

    function triggerLogoEasterEgg() {
        // Spin the logo
        const logo = document.querySelector('.nav-logo-mark');
        if (logo) {
            logo.style.transition = 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)';
            logo.style.transform = 'rotate(360deg) scale(1.2)';

            setTimeout(function() {
                logo.style.transform = 'rotate(0deg) scale(1)';
            }, 600);
        }

        showEasterEggMessage('Nice clicking skills! Here\'s a virtual high-five.');
    }

    function createConfetti(color) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        confetti.style.left = Math.random() * 100 + 'vw';
        confetti.style.background = color;
        confetti.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
        confetti.style.width = (Math.random() * 10 + 5) + 'px';
        confetti.style.height = (Math.random() * 10 + 5) + 'px';
        confetti.style.animationDuration = (Math.random() * 2 + 2) + 's';

        document.body.appendChild(confetti);

        // Remove after animation
        setTimeout(function() {
            confetti.remove();
        }, 4000);
    }

    function showEasterEggMessage(message) {
        // Create toast notification
        const toast = document.createElement('div');
        toast.style.cssText = 'position:fixed;bottom:var(--space-8);left:50%;transform:translateX(-50%) translateY(100px);background:var(--ink);color:white;padding:var(--space-4) var(--space-6);border-radius:12px;font-size:var(--text-sm);z-index:100002;opacity:0;transition:all 0.4s cubic-bezier(0.16,1,0.3,1);box-shadow:var(--shadow-lg);';
        toast.textContent = message;
        document.body.appendChild(toast);

        // Animate in
        setTimeout(function() {
            toast.style.opacity = '1';
            toast.style.transform = 'translateX(-50%) translateY(0)';
        }, 10);

        // Animate out and remove
        setTimeout(function() {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(-50%) translateY(20px)';
            setTimeout(function() {
                toast.remove();
            }, 400);
        }, 3000);
    }

    /**
     * Back to Top Button - Smooth scroll back to top
     */
    function initBackToTop() {
        // Create back to top button
        const backToTop = document.createElement('button');
        backToTop.className = 'back-to-top';
        backToTop.setAttribute('aria-label', 'Back to top');
        backToTop.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="18,15 12,9 6,15"/></svg>';
        document.body.appendChild(backToTop);

        // Show/hide based on scroll position
        let ticking = false;
        const scrollThreshold = 400;

        function handleScroll() {
            if (window.pageYOffset > scrollThreshold) {
                backToTop.classList.add('visible');
            } else {
                backToTop.classList.remove('visible');
            }
            ticking = false;
        }

        window.addEventListener('scroll', function() {
            if (!ticking) {
                requestAnimationFrame(handleScroll);
                ticking = true;
            }
        }, { passive: true });

        // Scroll to top on click
        backToTop.addEventListener('click', function() {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });

        // Initial check
        handleScroll();
    }

})();
