import {useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {z} from 'zod';
import {AnimatePresence, motion} from 'framer-motion';
import {useEffect, useRef} from 'react';
import {useAuctionStore} from '@/store/auctionStore';
import './BidEntry.css';

const schema = z.object({
    playerName: z.string().min(2, 'Enter player name'),
    captainId: z.string().min(1, 'Select a captain'),
    soldPoints: z.coerce.number().int().positive('Points must be > 0'),
});

type BidForm = z.infer<typeof schema>;

export function BidEntry() {
    const {captains, placeBid, undoLastBid, error, clearError, bids} = useAuctionStore();
    const playerRef = useRef<HTMLInputElement>(null);

    const {register, handleSubmit, reset, setFocus, formState: {errors}} = useForm<BidForm>({
        resolver: zodResolver(schema),
    });

    const onSubmit = (data: BidForm) => {
        placeBid(data.playerName, data.captainId, data.soldPoints);
        reset();
        setTimeout(() => setFocus('playerName'), 50);
    };

    useEffect(() => {
        playerRef.current?.focus();
    }, []);

    useEffect(() => {
        if (error) {
            const t = setTimeout(clearError, 4000);
            return () => clearTimeout(t);
        }
    }, [error, clearError]);

    return (
        <div className="bid-entry">
            <div className="bid-entry__header">
                <h2 className="bid-entry__title">Record Sale</h2>
                <span className="bid-entry__shortcut">Tab → Enter to submit</span>
            </div>

            <form className="bid-entry__form" onSubmit={handleSubmit(onSubmit)}>
                <div className="bid-entry__field">
                    <label className="bid-entry__label">Player Name</label>
                    <input
                        className="bid-entry__input"
                        placeholder="e.g. Rohit Verma"
                        autoComplete="off"
                        {...register('playerName')}
                        ref={e => {
                            register('playerName').ref(e);
                            (playerRef as React.MutableRefObject<HTMLInputElement | null>).current = e;
                        }}
                    />
                    {errors.playerName && <span className="bid-entry__error">{errors.playerName.message}</span>}
                </div>

                <div className="bid-entry__field">
                    <label className="bid-entry__label">Captain</label>
                    <select className="bid-entry__select" {...register('captainId')}>
                        <option value="">— Select Captain —</option>
                        {captains.map(c => (
                            <option key={c.id} value={c.id} disabled={c.purseRemaining === 0}>
                                {c.name} ({c.purseRemaining} pts)
                            </option>
                        ))}
                    </select>
                    {errors.captainId && <span className="bid-entry__error">{errors.captainId.message}</span>}
                </div>

                <div className="bid-entry__field">
                    <label className="bid-entry__label">Sold Points</label>
                    <input
                        className="bid-entry__input bid-entry__input--points"
                        type="number"
                        placeholder="e.g. 250"
                        min={1}
                        {...register('soldPoints')}
                    />
                    {errors.soldPoints && <span className="bid-entry__error">{errors.soldPoints.message}</span>}
                </div>

                <AnimatePresence>
                    {error && (
                        <motion.div
                            className="bid-entry__api-error"
                            initial={{opacity: 0, y: -8}}
                            animate={{opacity: 1, y: 0}}
                            exit={{opacity: 0}}
                        >
                            {error}
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="bid-entry__actions">
                    <button type="submit" className="bid-entry__btn bid-entry__btn--confirm">
                        SOLD
                    </button>
                    <button
                        type="button"
                        className="bid-entry__btn bid-entry__btn--undo"
                        onClick={undoLastBid}
                        disabled={bids.length === 0}
                    >
                        Undo
                    </button>
                </div>
            </form>
        </div>
    );
}
