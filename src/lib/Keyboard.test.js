import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/svelte';
import Keyboard from './Keyboard.svelte';

describe('Keyboard', () => {
	it('renders with default qwerty standard layout', () => {
		const { container } = render(Keyboard);
		const keys = container.querySelectorAll('button.key');
		expect(keys.length).toBeGreaterThan(0);

		// Check first row has qwerty keys
		const keyTexts = Array.from(keys).map((k) => k.textContent.trim());
		expect(keyTexts).toContain('q');
		expect(keyTexts).toContain('w');
		expect(keyTexts).toContain('e');
	});

	it('renders rows correctly', () => {
		const { container } = render(Keyboard);
		const rows = container.querySelectorAll('.row');
		expect(rows.length).toBeGreaterThanOrEqual(4); // standard has 4 rows
	});

	it('fires onkeydown callback when a key is pressed', async () => {
		const handler = vi.fn();
		const { container } = render(Keyboard, { props: { onkeydown: handler } });

		const qKey = container.querySelector('.key--q');
		expect(qKey).toBeTruthy();

		await fireEvent.mouseDown(qKey);
		expect(handler).toHaveBeenCalledWith('q');
	});

	it('fires onkeydown with "Space" value for Space key', async () => {
		const handler = vi.fn();
		const { container } = render(Keyboard, { props: { onkeydown: handler } });

		const spaceKey = container.querySelector('.key--Space');
		expect(spaceKey).toBeTruthy();

		await fireEvent.mouseDown(spaceKey);
		expect(handler).toHaveBeenCalledWith('Space');
	});

	it('does not fire onkeydown for Shift key (toggles shift)', async () => {
		const handler = vi.fn();
		const { container } = render(Keyboard, { props: { onkeydown: handler } });

		const shiftKey = container.querySelector('.key--Shift');
		expect(shiftKey).toBeTruthy();

		await fireEvent.mouseDown(shiftKey);
		expect(handler).not.toHaveBeenCalled();
	});

	it('outputs uppercase after Shift is pressed', async () => {
		const handler = vi.fn();
		const { container } = render(Keyboard, { props: { onkeydown: handler } });

		const shiftKey = container.querySelector('.key--Shift');
		await fireEvent.mouseDown(shiftKey);

		const aKey = container.querySelector('.key--a');
		await fireEvent.mouseDown(aKey);

		expect(handler).toHaveBeenCalledWith('A');
	});

	it('renders with wordle layout', () => {
		const { container } = render(Keyboard, { props: { layout: 'wordle' } });
		const keys = container.querySelectorAll('button.key');
		expect(keys.length).toBeGreaterThan(0);

		// Wordle has Enter and Backspace but no Shift, Space, Page keys
		expect(container.querySelector('.key--Enter')).toBeTruthy();
		expect(container.querySelector('.key--Backspace')).toBeTruthy();
		expect(container.querySelector('.key--Shift')).toBeFalsy();
		expect(container.querySelector('.key--Space')).toBeFalsy();
	});

	it('renders with crossword layout', () => {
		const { container } = render(Keyboard, { props: { layout: 'crossword' } });
		const keys = container.querySelectorAll('button.key');
		expect(keys.length).toBeGreaterThan(0);
	});

	it('renders with azerty localization', () => {
		const { container } = render(Keyboard, {
			props: { localizationLayout: 'azerty' },
		});
		const keys = container.querySelectorAll('button.key');
		const keyTexts = Array.from(keys).map((k) => k.textContent.trim());

		// Azerty has 'a' in a different position but still has it
		expect(keyTexts).toContain('a');
		expect(keyTexts).toContain('z');
	});

	it('renders custom layout', () => {
		const custom = [
			{ row: 0, value: 'x' },
			{ row: 0, value: 'y' },
			{ row: 1, value: 'z' },
		];
		const { container } = render(Keyboard, { props: { custom } });
		const keys = container.querySelectorAll('button.key');
		expect(keys.length).toBe(3);

		const keyTexts = Array.from(keys).map((k) => k.textContent.trim());
		expect(keyTexts).toContain('x');
		expect(keyTexts).toContain('y');
		expect(keyTexts).toContain('z');
	});

	it('applies keyClass to matching keys', () => {
		const { container } = render(Keyboard, {
			props: { keyClass: { q: 'highlight' } },
		});
		const qKey = container.querySelector('.key--q');
		expect(qKey.classList.contains('highlight')).toBe(true);
	});

	it('renders SVG for Backspace and Enter keys', () => {
		const { container } = render(Keyboard);
		const backspaceKey = container.querySelector('.key--Backspace');
		const enterKey = container.querySelector('.key--Enter');

		expect(backspaceKey.querySelector('svg')).toBeTruthy();
		expect(enterKey.querySelector('svg')).toBeTruthy();
	});

	it('respects noSwap prop', () => {
		const { container } = render(Keyboard, {
			props: { noSwap: ['Backspace'] },
		});
		const backspaceKey = container.querySelector('.key--Backspace');
		// Should show "Backspace" text instead of SVG
		expect(backspaceKey.querySelector('svg')).toBeFalsy();
		expect(backspaceKey.textContent.trim()).toBe('Backspace');
	});

	it('switches pages when Page1 is pressed', async () => {
		const { container } = render(Keyboard);

		// Initially page 0 is visible
		const pages = container.querySelectorAll('.page');
		expect(pages[0].classList.contains('visible')).toBe(true);
		expect(pages[1].classList.contains('visible')).toBe(false);

		// Click Page1 button
		const page1Key = container.querySelector('.key--Page1');
		await fireEvent.mouseDown(page1Key);

		expect(pages[0].classList.contains('visible')).toBe(false);
		expect(pages[1].classList.contains('visible')).toBe(true);
	});

	it('all buttons have type="button"', () => {
		const { container } = render(Keyboard);
		const buttons = container.querySelectorAll('button');
		buttons.forEach((btn) => {
			expect(btn.getAttribute('type')).toBe('button');
		});
	});

	it('marks active key on mousedown and clears on mouseup', async () => {
		const { container } = render(Keyboard, { props: { onkeydown: vi.fn() } });
		const qKey = container.querySelector('.key--q');

		await fireEvent.mouseDown(qKey);
		expect(qKey.classList.contains('active')).toBe(true);

		await fireEvent.mouseUp(qKey);
		// Active clears after 50ms timeout
		await new Promise((r) => setTimeout(r, 100));
		expect(qKey.classList.contains('active')).toBe(false);
	});
});
